import { google } from 'googleapis';
import { Readable } from 'stream';

// Função para sanitizar entrada e prevenir XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove caracteres perigosos
    .substring(0, 1000); // Limita tamanho
}

// Função para validar tamanho do payload (aumentado para suportar arquivos)
function validatePayloadSize(data) {
  const jsonString = JSON.stringify(data);
  const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
  const maxSize = 10 * 1024 * 1024; // 10MB (para suportar arquivos base64)
  return sizeInBytes <= maxSize;
}

// Função para obter MIME type do arquivo
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export default async function handler(req, res) {
  // Configurar CORS de forma mais restritiva
  const allowedOrigins = [
    'https://recrutamento-phoenix.vercel.app',
    'https://www.phoenixenglish.com.br',
    process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
  ];
  
  const origin = req.headers.origin || req.headers.Origin;
  
  // Adicionar CORS se origem permitida
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Configurar headers comuns
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Tratar OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Parse do body (Vercel já faz parse automático)
  const body = req.body;
  
  if (!body) {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  
  // Validar tamanho do payload
  if (!validatePayloadSize(body)) {
    return res.status(413).json({ 
      error: 'Payload muito grande',
      details: 'Os dados enviados excedem o limite permitido'
    });
  }

  // Extrair e sanitizar dados
  let { nome, email, telefone, idade, curriculo, curriculoNome } = body;
  
  nome = sanitizeInput(nome);
  email = sanitizeInput(email);
  telefone = sanitizeInput(telefone);
  idade = sanitizeInput(idade);
  curriculoNome = sanitizeInput(curriculoNome || '');

  // Validar campos obrigatórios
  if (!nome || !email || !telefone || !idade || !curriculo) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios faltando',
      details: 'Nome, email, telefone, idade e currículo são obrigatórios'
    });
  }
  
  // Validar formato do arquivo
  if (!curriculoNome || !curriculoNome.match(/\.(pdf|doc|docx)$/i)) {
    return res.status(400).json({ 
      error: 'Arquivo inválido',
      details: 'O currículo deve ser um arquivo PDF, DOC ou DOCX'
    });
  }
  
  // Validar comprimento mínimo
  if (nome.length < 2 || nome.length > 100) {
    return res.status(400).json({ 
      error: 'Nome inválido',
      details: 'O nome deve ter entre 2 e 100 caracteres'
    });
  }

  // Validar formato de email (mais rigoroso)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ 
      error: 'Email inválido',
      details: 'Por favor, forneça um email válido'
    });
  }

  // Validar telefone (formato brasileiro)
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!telefoneRegex.test(telefone)) {
    return res.status(400).json({ 
      error: 'Telefone inválido',
      details: 'Por favor, forneça um telefone no formato (99) 99999-9999'
    });
  }
  
  // Validar idade
  const idadeNum = parseInt(idade);
  if (isNaN(idadeNum) || idadeNum < 16 || idadeNum > 99) {
    return res.status(400).json({ 
      error: 'Idade inválida',
      details: 'A idade deve estar entre 16 e 99 anos'
    });
  }

  try {
    // Autenticação com Google Service Account (segura)
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    const sheetId = process.env.SHEET_ID;
    const driveFolderId = process.env.DRIVE_FOLDER_ID;
    const sharedDriveId = process.env.SHARED_DRIVE_ID; // Nova variável para shared drive
    
    // Debug das variáveis de ambiente
    console.log('Variáveis de ambiente:', {
      SHEET_ID: sheetId ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET ? 'CONFIGURADO' : 'NÃO CONFIGURADO'
    });
    
    // Debug do Service Account
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log('Service Account email:', credentials.client_email);

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.SHEET_ID) {
      console.error('Variáveis de ambiente não configuradas');
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor',
        details: 'As credenciais do Google não estão configuradas'
      });
    }

    // Configuração: Upload via Cloudinary
    console.log('Configuração: Upload de arquivos via Cloudinary');
    
    // Upload do arquivo usando Cloudinary (gratuito)
    let fileUrl = '';
    try {
      console.log('Iniciando upload do currículo...');
      
      // Verificar se Cloudinary está configurado
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error('CLOUDINARY_CLOUD_NAME não configurado');
      }
      
      // Criar nome do arquivo usando o nome da pessoa
      const timestamp = Date.now();
      const nomeSeguro = nome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const extensao = curriculoNome.split('.').pop().toLowerCase();
      const nomeArquivo = `Curriculo_${nomeSeguro}.${extensao}`;
      
      console.log('Fazendo upload:', nomeArquivo);
      console.log('Arquivo original:', curriculoNome);
      
      // Upload para Cloudinary como raw (para documentos)
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`;
      
      console.log('Tamanho do curriculo:', curriculo.length);
      console.log('Extensão:', extensao);
      
      // Debug das variáveis
      console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
      console.log('CLOUDINARY_UPLOAD_PRESET:', process.env.CLOUDINARY_UPLOAD_PRESET);
      console.log('URL do Cloudinary:', cloudinaryUrl);
      
      // Usar URLSearchParams - mais simples e confiável para o Cloudinary
      const formData = new URLSearchParams();
      formData.append('file', curriculo);
      formData.append('upload_preset', 'ml_default');
      formData.append('public_id', `curriculos/${nomeArquivo.replace(/\.[^/.]+$/, '')}`);
      formData.append('resource_type', 'raw');
      
      console.log('Enviando dados para Cloudinary...');
      console.log('Public ID:', `curriculos/${nomeArquivo.replace(/\.[^/.]+$/, '')}`);
      console.log('Arquivo:', nomeArquivo);
      console.log('Tamanho do curriculo:', curriculo.length);
      console.log('Primeiros 50 chars do curriculo:', curriculo.substring(0, 50));
      console.log('É data URI?', curriculo.startsWith('data:'));
      
      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      const responseText = await uploadResponse.text();
      
      console.log('Resposta do Cloudinary:');
      console.log('Status:', uploadResponse.status);
      console.log('Response:', responseText);
      
      if (!uploadResponse.ok) {
        throw new Error(`Cloudinary upload failed: ${uploadResponse.status} - ${responseText}`);
      }
      
      const uploadResult = JSON.parse(responseText);
      
      console.log('Upload result completo:', JSON.stringify(uploadResult, null, 2));
      
      // Usar URL direta do Cloudinary para raw files
      let baseUrl = uploadResult.secure_url;
      
      // Se a URL não for raw, corrigir manualmente
      if (baseUrl.includes('/image/upload/')) {
        baseUrl = baseUrl.replace('/image/upload/', '/raw/upload/');
      }
      
      // Adicionar parâmetro fl_attachment para forçar download com nome e extensão corretos
      fileUrl = baseUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(nomeArquivo)}/`);
      
      console.log('Upload realizado com sucesso:', fileUrl);
      console.log('URL original:', uploadResult.secure_url);
      console.log('URL base corrigida:', baseUrl);
      console.log('Nome do arquivo:', nomeArquivo);
      
    } catch (uploadError) {
      console.error('Erro detalhado ao fazer upload do currículo:', uploadError);
      console.error('Stack trace:', uploadError.stack);
      
      // Fallback: salvar informações do arquivo sem o upload
      const timestamp = Date.now();
      const nomeSeguro = nome.replace(/[^a-zA-Z0-9]/g, '_');
      fileUrl = `ARQUIVO_NAO_SALVO: ${curriculoNome} (${nomeSeguro}_${timestamp}) - Erro: ${uploadError.message}`;
      
      console.log('Usando fallback para arquivo:', fileUrl);
    }

    // Preparar data/hora no formato brasileiro
    const agora = new Date();
    const dataCadastro = agora.toLocaleString('pt-BR', {
      timeZone: 'America/Fortaleza',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Preparar dados para inserção (já sanitizados)
    const values = [[
      dataCadastro,
      nome,
      email.toLowerCase(), // Normalizar email
      telefone,
      idadeNum, // Idade como número
      fileUrl // Link do currículo no Drive
    ]];

    // Inserir dados na planilha
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Candidatos!A2:F', // 6 colunas: Data, Nome, Email, Telefone, Idade, Link do Currículo
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    // Verificar resposta
    if (response.status !== 200) {
      console.error('Erro da API Google Sheets:', response.data);
      throw new Error('Erro ao enviar para a planilha');
    }

    // Log de sucesso (sem dados sensíveis)
    if (process.env.NODE_ENV === 'development') {
      console.log('Candidatura registrada com sucesso:', { timestamp: dataCadastro });
    }

    // Resposta de sucesso
    return res.status(200).json({ 
      success: true,
      message: 'Candidatura enviada com sucesso!'
    });

  } catch (error) {
    console.error('Erro no backend:', error?.message || error);
    console.error('Stack trace completo:', error?.stack);
    console.error('Tipo do erro:', error?.constructor?.name);
    
    // Mostrar detalhes do erro para debug
    const errorMessage = error?.message || 'Erro desconhecido';
    const errorDetails = {
      message: errorMessage,
      type: error?.constructor?.name,
      stack: error?.stack?.split('\n').slice(0, 3).join('\n') // Primeiras 3 linhas do stack
    };

    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: errorMessage,
      debug: errorDetails
    });
  }
};
