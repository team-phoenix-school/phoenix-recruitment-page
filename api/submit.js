import { google } from 'googleapis';

// Função para sanitizar entrada e prevenir XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove caracteres perigosos
    .substring(0, 1000); // Limita tamanho
}

// Função para validar tamanho do payload
function validatePayloadSize(data) {
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonString]).size;
  const maxSize = 50 * 1024; // 50KB
  return sizeInBytes <= maxSize;
}

export default async function handler(req, res) {
  // Configurar CORS de forma mais restritiva
  const allowedOrigins = [
    'https://phoenix-recruitment.netlify.app',
    'https://www.phoenixenglish.com.br',
    process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  if (req.method === 'OPTIONS') {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Configurar CORS para requisição real
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Headers de segurança adicionais
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Validar tamanho do payload
  if (!validatePayloadSize(req.body)) {
    return res.status(413).json({ 
      error: 'Payload muito grande',
      details: 'Os dados enviados excedem o limite permitido'
    });
  }

  // Extrair e sanitizar dados
  let { nome, email, telefone, idade, cargo, experiencia, motivacao } = req.body;
  
  nome = sanitizeInput(nome);
  email = sanitizeInput(email);
  telefone = sanitizeInput(telefone);
  idade = sanitizeInput(idade);
  cargo = sanitizeInput(cargo);
  experiencia = sanitizeInput(experiencia || '');
  motivacao = sanitizeInput(motivacao || '');

  // Validar campos obrigatórios
  if (!nome || !email || !telefone || !idade || !cargo) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios faltando',
      details: 'Nome, email, telefone, idade e cargo são obrigatórios'
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
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.SHEET_ID;

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.SHEET_ID) {
      console.error('Variáveis de ambiente não configuradas');
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor',
        details: 'As credenciais do Google não estão configuradas'
      });
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
      cargo,
      experiencia,
      motivacao,
      'Novo' // Status inicial
    ]];

    // Inserir dados na planilha
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Candidatos!A2:I', // 9 colunas: Data, Nome, Email, Telefone, Idade, Cargo, Experiência, Motivação, Status
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
      console.log('Candidatura registrada com sucesso:', { cargo, timestamp: dataCadastro });
    }

    // Resposta de sucesso
    return res.status(200).json({ 
      success: true,
      message: 'Candidatura enviada com sucesso!'
    });

  } catch (error) {
    console.error('Erro no backend:', error?.message || error);
    
    // Não expor detalhes internos em produção
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message 
      : 'Erro ao processar sua candidatura';

    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: errorMessage
    });
  }
}
