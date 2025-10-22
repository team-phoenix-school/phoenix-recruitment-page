import { google } from 'googleapis';
import { Readable } from 'stream';

// Função para sanitizar entrada e prevenir XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove caracteres perigosos
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs (exceto para arquivos)
    .substring(0, 500); // Limita tamanho
}

// Função para validar extensão de arquivo
function isValidFileExtension(filename) {
  const allowedExtensions = ['pdf', 'doc', 'docx'];
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
}

// Função para detectar possíveis malwares em nomes de arquivo
function isSecureFilename(filename) {
  // Rejeitar nomes suspeitos
  const suspiciousPatterns = [
    /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.vbs$/i, /\.js$/i,
    /\.jar$/i, /\.com$/i, /\.pif$/i, /\.msi$/i, /\.dll$/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(filename));
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

  // Validação básica dos dados obrigatórios
  if (!nome || !email || !telefone || !idade || !curriculo || !curriculoNome) {
    return res.status(400).json({ 
      error: 'Dados obrigatórios não fornecidos',
      details: 'Nome, email, telefone, idade e currículo são obrigatórios'
    });
  }

  // Validações de segurança
  if (!isValidFileExtension(curriculoNome)) {
    return res.status(400).json({
      error: 'Tipo de arquivo não permitido',
      details: 'Apenas arquivos PDF, DOC e DOCX são aceitos'
    });
  }

  if (!isSecureFilename(curriculoNome)) {
    return res.status(400).json({
      error: 'Nome de arquivo não permitido',
      details: 'O arquivo possui uma extensão não segura'
    });
  }

  // Validar comprimento do nome
  if (nome.length < 2 || nome.length > 100) {
    return res.status(400).json({ 
      error: 'Nome inválido',
      details: 'O nome deve ter entre 2 e 100 caracteres'
    });
  }

  // Validar formato de email
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
      details: 'Por favor, forneça uma idade entre 16 e 99 anos'
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
    const sheetId = process.env.SHEET_ID;
    
    // Verificar configuração sem expor dados sensíveis
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.SHEET_ID) {
      console.error('Variáveis de ambiente não configuradas');
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor',
        details: 'As credenciais do Google não estão configuradas'
      });
    }

    // Upload via Dropbox
    let fileUrl = '';
    try {
      // Verificar se Dropbox está configurado
      if (!process.env.DROPBOX_ACCESS_TOKEN) {
        throw new Error('Serviço de upload não configurado');
      }
      
      // Criar nome do arquivo usando o nome da pessoa + timestamp para evitar conflitos
      const timestamp = Date.now();
      const nomeSeguro = nome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const extensao = curriculoNome.split('.').pop().toLowerCase();
      const nomeArquivo = `Curriculo_${nomeSeguro}_${timestamp}.${extensao}`;
      const caminhoArquivo = `/curriculos/${nomeArquivo}`;
      
      // Validar e converter arquivo
      const base64Data = curriculo.includes(',') ? curriculo.split(',')[1] : curriculo;
      
      // Validar se é base64 válido
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        throw new Error('Formato de arquivo inválido');
      }
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Validar tamanho do arquivo (máximo 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande');
      }
      
      // Upload para Dropbox
      const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: caminhoArquivo,
            mode: 'add',
            autorename: true
          })
        },
        body: buffer
      });
      
      const responseText = await uploadResponse.text();
      
      if (!uploadResponse.ok) {
        throw new Error(`Dropbox upload failed: ${uploadResponse.status} - ${responseText}`);
      }
      
      let uploadResult;
      try {
        uploadResult = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Erro no serviço de upload');
      }
      
      // Criar link de compartilhamento (com tratamento para link existente)
      let shareResult;
      
      try {
        const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: uploadResult.path_display,
            settings: {
              requested_visibility: 'public'
            }
          })
        });
        
        const shareResponseText = await shareResponse.text();
        
        if (shareResponse.status === 409) {
          // Link já existe, buscar o link existente
          const listResponse = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              path: uploadResult.path_display,
              direct_only: true
            })
          });
          
          const listResponseText = await listResponse.text();
          if (listResponse.ok) {
            const listResult = JSON.parse(listResponseText);
            if (listResult.links && listResult.links.length > 0) {
              shareResult = { url: listResult.links[0].url };
            } else {
              throw new Error('Não foi possível obter link do arquivo');
            }
          } else {
            throw new Error('Erro ao buscar link existente');
          }
        } else if (!shareResponse.ok) {
          throw new Error(`Dropbox share failed: ${shareResponse.status} - ${shareResponseText}`);
        } else {
          shareResult = JSON.parse(shareResponseText);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar link de compartilhamento');
      }
      
      if (shareResult && shareResult.url) {
        // Converter para link de download direto
        fileUrl = shareResult.url.replace('?dl=0', '?dl=1');
      } else {
        throw new Error('Erro ao gerar link do arquivo');
      }
      
    } catch (uploadError) {
      // Log apenas para debug interno (sem expor detalhes)
      console.error('Upload error:', uploadError.message);
      
      // Fallback: salvar informações do arquivo sem o upload
      const timestamp = Date.now();
      const nomeSeguro = nome.replace(/[^a-zA-Z0-9]/g, '_');
      fileUrl = `ARQUIVO_PENDENTE: ${nomeSeguro}_${timestamp}`;
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
