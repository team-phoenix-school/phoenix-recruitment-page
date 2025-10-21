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
  const sizeInBytes = new Blob([jsonString]).size;
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

export const handler = async (event, context) => {
  // Configurar CORS de forma mais restritiva
  const allowedOrigins = [
    'https://recrutamento-phoenix.netlify.app',
    'https://www.phoenixenglish.com.br',
    process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
  ];
  
  const origin = event.headers.origin || event.headers.Origin;
  
  // Headers comuns
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
  
  // Adicionar CORS se origem permitida
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  // Tratar OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // Apenas aceitar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  // Parse do body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'JSON inválido' })
    };
  }
  
  // Validar tamanho do payload
  if (!validatePayloadSize(body)) {
    return {
      statusCode: 413,
      headers,
      body: JSON.stringify({ 
        error: 'Payload muito grande',
        details: 'Os dados enviados excedem o limite permitido'
      })
    };
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
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email, telefone, idade e currículo são obrigatórios'
      })
    };
  }
  
  // Validar formato do arquivo
  if (!curriculoNome || !curriculoNome.match(/\.(pdf|doc|docx)$/i)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Arquivo inválido',
        details: 'O currículo deve ser um arquivo PDF, DOC ou DOCX'
      })
    };
  }
  
  // Validar comprimento mínimo
  if (nome.length < 2 || nome.length > 100) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Nome inválido',
        details: 'O nome deve ter entre 2 e 100 caracteres'
      })
    };
  }

  // Validar formato de email (mais rigoroso)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Email inválido',
        details: 'Por favor, forneça um email válido'
      })
    };
  }

  // Validar telefone (formato brasileiro)
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!telefoneRegex.test(telefone)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Telefone inválido',
        details: 'Por favor, forneça um telefone no formato (99) 99999-9999'
      })
    };
  }
  
  // Validar idade
  const idadeNum = parseInt(idade);
  if (isNaN(idadeNum) || idadeNum < 16 || idadeNum > 99) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Idade inválida',
        details: 'A idade deve estar entre 16 e 99 anos'
      })
    };
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

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.SHEET_ID) {
      console.error('Variáveis de ambiente não configuradas');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro de configuração do servidor',
          details: 'As credenciais do Google não estão configuradas'
        })
      };
    }

    // Verificar se pelo menos um local de armazenamento está configurado
    if (!driveFolderId && !sharedDriveId) {
      console.error('Nenhum local de armazenamento configurado');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro de configuração do servidor',
          details: 'Local de armazenamento não configurado'
        })
      };
    }
    
    // Upload do currículo para o Google Drive
    let fileUrl = '';
    try {
      // Remover prefixo data:... do base64
      const base64Data = curriculo.split(',')[1] || curriculo;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Criar nome único para o arquivo
      const timestamp = Date.now();
      const nomeSeguro = nome.replace(/[^a-zA-Z0-9]/g, '_');
      const nomeUnico = `${nomeSeguro}_${timestamp}_${curriculoNome}`;
      
      // Configurar metadados do arquivo baseado no tipo de armazenamento
      const fileMetadata = {
        name: nomeUnico
      };

      // Se temos um shared drive, usar ele; caso contrário, usar pasta normal
      if (sharedDriveId) {
        console.log('Usando shared drive:', sharedDriveId);
        // Para shared drives, definir o drive pai
        fileMetadata.driveId = sharedDriveId;
        if (driveFolderId) {
          fileMetadata.parents = [driveFolderId];
          console.log('Com pasta específica:', driveFolderId);
        }
      } else if (driveFolderId) {
        console.log('Usando pasta normal:', driveFolderId);
        // Para pastas normais
        fileMetadata.parents = [driveFolderId];
      } else {
        console.log('Nenhum local de armazenamento específico configurado');
      }
      
      const media = {
        mimeType: getMimeType(curriculoNome),
        body: Readable.from(buffer)
      };
      
      // Configurar parâmetros da requisição
      const createParams = {
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
        supportsAllDrives: true
      };

      // Se estamos usando shared drive, adicionar parâmetro específico
      if (sharedDriveId) {
        createParams.supportsTeamDrives = true;
      }
      
      const file = await drive.files.create(createParams);
      
      // Configurar permissões
      const permissionParams = {
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        },
        supportsAllDrives: true
      };

      if (sharedDriveId) {
        permissionParams.supportsTeamDrives = true;
      }
      
      // Tornar o arquivo acessível com o link
      await drive.permissions.create(permissionParams);
      
      fileUrl = file.data.webViewLink;
      
    } catch (uploadError) {
      console.error('Erro ao fazer upload do currículo:', uploadError);
      console.error('Detalhes do erro:', {
        message: uploadError.message,
        code: uploadError.code,
        status: uploadError.response?.status,
        statusText: uploadError.response?.statusText,
        data: uploadError.response?.data
      });
      throw new Error('Falha ao salvar o currículo');
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Candidatura enviada com sucesso!'
      })
    };

  } catch (error) {
    console.error('Erro no backend:', error?.message || error);
    
    // Não expor detalhes internos em produção
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message 
      : 'Erro ao processar sua candidatura';

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: errorMessage
      })
    };
  }
};
