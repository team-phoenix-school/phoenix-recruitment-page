/**
 * Google Apps Script para integração com Google Sheets + Google Drive
 * 
 * INSTRUÇÕES:
 * 1. Acesse script.google.com
 * 2. Crie um novo projeto
 * 3. Cole este código
 * 4. Substitua 'SEU_ID_DA_PLANILHA_AQUI' pelo ID da sua planilha
 * 5. Substitua 'SEU_ID_DA_PASTA_DRIVE_AQUI' pelo ID da pasta do Drive
 * 6. Publique como aplicativo web com acesso "Qualquer pessoa"
 * 7. Copie a URL e cole no script.js da landing page (variável GOOGLE_SCRIPT_URL)
 */

// Substitua pelo ID da sua planilha Google Sheets
const SHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';

// Substitua pelo ID da pasta do Google Drive onde os currículos serão salvos
// Para obter o ID: abra a pasta no Drive e copie o ID da URL
// Exemplo: https://drive.google.com/drive/folders/[ID_DA_PASTA]
const DRIVE_FOLDER_ID = 'SEU_ID_DA_PASTA_DRIVE_AQUI';

function doPost(e) {
  try {
    // Parse dos dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    // Validar dados obrigatórios
    if (!data.nome || !data.email || !data.telefone) {
      throw new Error('Dados obrigatórios faltando');
    }
    
    // Processar arquivo se existir
    let fileUrl = '';
    if (data.curriculo && data.curriculoNome) {
      fileUrl = salvarArquivoDrive(data.curriculo, data.curriculoNome, data.nome);
    }
    
    // Salvar na planilha
    salvarNaPlanilha(data, fileUrl);
    
    // Enviar email de notificação
    enviarNotificacaoEmail(data, fileUrl);
    
    // Resposta de sucesso
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Candidatura recebida com sucesso!'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Erro ao processar candidatura:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Erro ao processar candidatura: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function salvarArquivoDrive(base64Data, nomeArquivo, nomeCandidato) {
  try {
    // Remover prefixo data:... se existir
    const base64 = base64Data.split(',')[1] || base64Data;
    
    // Decodificar base64
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      getMimeType(nomeArquivo),
      nomeArquivo
    );
    
    // Obter pasta do Drive
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Criar nome único para o arquivo
    const timestamp = new Date().getTime();
    const nomeUnico = `${nomeCandidato.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${nomeArquivo}`;
    
    // Salvar arquivo
    const file = folder.createFile(blob.setName(nomeUnico));
    
    // Tornar o arquivo acessível (apenas com link)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Retornar URL do arquivo
    return file.getUrl();
    
  } catch (error) {
    console.error('Erro ao salvar arquivo no Drive:', error);
    throw new Error('Falha ao salvar currículo: ' + error.toString());
  }
}

function getMimeType(nomeArquivo) {
  const extensao = nomeArquivo.split('.').pop().toLowerCase();
  
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return mimeTypes[extensao] || 'application/octet-stream';
}

function salvarNaPlanilha(data, fileUrl) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    const rowData = [
      new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      data.nome || '',
      data.email || '',
      data.telefone || '',
      fileUrl || 'Não enviado',
      'Novo' // Status inicial
    ];
    
    sheet.appendRow(rowData);
    console.log('Dados salvos na planilha com sucesso');
    
  } catch (error) {
    console.error('Erro ao salvar na planilha:', error);
    throw error;
  }
}

function enviarNotificacaoEmail(data, fileUrl) {
  try {
    const EMAIL_RH = 'phoenixschool10@gmail.com';
    
    const assunto = `Nova Candidatura - Agente Comercial Phoenix`;
    const corpo = `
Nova candidatura recebida para o processo seletivo:

📋 DADOS DO CANDIDATO:
• Nome: ${data.nome}
• Email: ${data.email}
• Telefone: ${data.telefone}

📄 CURRÍCULO:
${fileUrl ? `Link: ${fileUrl}` : 'Não enviado'}

📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}

---
Phoenix English School
Processo Seletivo - Agente Comercial
    `;
    
    MailApp.sendEmail(EMAIL_RH, assunto, corpo);
    console.log('Email de notificação enviado');
    
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    // Não interrompe o processo se o email falhar
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Google Apps Script está funcionando!',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function configurarPlanilha() {
  /**
   * Execute esta função UMA VEZ para configurar a planilha
   */
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    const headers = [
      'Data/Hora',
      'Nome',
      'Email',
      'Telefone',
      'Link do Currículo',
      'Status'
    ];
    
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const hasHeaders = firstRow.some(cell => cell !== '');
    
    if (!hasHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#A70240');
      headerRange.setFontColor('#FFFFFF');
      
      sheet.autoResizeColumns(1, headers.length);
      
      console.log('Planilha configurada com sucesso!');
    } else {
      console.log('Planilha já possui cabeçalhos.');
    }
    
  } catch (error) {
    console.error('Erro ao configurar planilha:', error);
  }
}

function criarPastaDrive() {
  /**
   * Execute esta função UMA VEZ para criar a pasta de currículos
   */
  try {
    const folder = DriveApp.createFolder('Phoenix - Currículos Processo Seletivo');
    console.log('Pasta criada com sucesso!');
    console.log('ID da pasta:', folder.getId());
    console.log('URL da pasta:', folder.getUrl());
    console.log('Copie o ID acima e cole na variável DRIVE_FOLDER_ID');
    
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
  }
}
