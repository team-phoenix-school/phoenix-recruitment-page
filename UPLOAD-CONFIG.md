# 📤 Configuração do Sistema de Upload de Currículos

## 🎯 Para onde os arquivos vão?

Os currículos enviados pelos candidatos são armazenados no **Google Drive** de forma segura e organizada.

---

## 📋 Fluxo Completo

```
Candidato preenche formulário
         ↓
Seleciona arquivo (PDF/DOC/DOCX)
         ↓
Validação no navegador (tipo e tamanho)
         ↓
Arquivo convertido para Base64
         ↓
Enviado para Google Apps Script
         ↓
Google Apps Script processa:
  • Salva arquivo no Google Drive
  • Registra dados na planilha Google Sheets
  • Envia email de notificação
         ↓
Candidato recebe confirmação
```

---

## 🔧 Configuração Passo a Passo

### **1. Criar Pasta no Google Drive**

1. Acesse [drive.google.com](https://drive.google.com)
2. Crie uma nova pasta chamada: **"Phoenix - Currículos Processo Seletivo"**
3. Abra a pasta e copie o **ID da URL**:
   ```
   https://drive.google.com/drive/folders/[COPIE_ESTE_ID]
   ```
4. Guarde este ID para o próximo passo

### **2. Criar Planilha Google Sheets**

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma nova planilha: **"Phoenix - Candidaturas"**
3. Copie o **ID da URL**:
   ```
   https://docs.google.com/spreadsheets/d/[COPIE_ESTE_ID]/edit
   ```
4. Guarde este ID

### **3. Configurar Google Apps Script**

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **"Novo projeto"**
3. Abra o arquivo `google-apps-script-upload.js` desta pasta
4. **Copie TODO o código** e cole no Google Apps Script
5. **Substitua os IDs**:
   ```javascript
   const SHEET_ID = 'COLE_O_ID_DA_PLANILHA_AQUI';
   const DRIVE_FOLDER_ID = 'COLE_O_ID_DA_PASTA_DRIVE_AQUI';
   ```
6. Salve o projeto (Ctrl+S) com nome: **"Phoenix Upload API"**

### **4. Executar Funções de Configuração**

No Google Apps Script:

1. Selecione a função `configurarPlanilha` no menu dropdown
2. Clique em **"Executar"** (▶️)
3. Autorize as permissões quando solicitado
4. Aguarde a mensagem de sucesso

Isso criará automaticamente os cabeçalhos na planilha:
- Data/Hora
- Nome
- Email
- Telefone
- Link do Currículo
- Status

### **5. Publicar como Web App**

1. No Google Apps Script, clique em **"Implantar"** > **"Nova implantação"**
2. Configurações:
   - **Tipo**: Aplicativo da web
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: **Qualquer pessoa**
3. Clique em **"Implantar"**
4. **Copie a URL gerada** (algo como: `https://script.google.com/macros/s/...`)
5. Clique em **"Concluído"**

### **6. Atualizar Landing Page**

1. Abra o arquivo `script.js` da landing page
2. Encontre a linha:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
   ```
3. Substitua pela URL copiada no passo anterior
4. Salve o arquivo

---

## ✅ Testar o Sistema

### **Teste 1: Verificar API**
1. Abra a URL do Google Apps Script no navegador
2. Você deve ver:
   ```json
   {
     "status": "ok",
     "message": "Google Apps Script está funcionando!",
     "timestamp": "..."
   }
   ```

### **Teste 2: Enviar Candidatura**
1. Acesse a landing page
2. Preencha o formulário
3. Faça upload de um currículo de teste
4. Envie o formulário
5. Verifique:
   - ✅ Arquivo apareceu no Google Drive
   - ✅ Dados foram registrados na planilha
   - ✅ Email de notificação foi recebido

---

## 🔒 Segurança

### **Validações Implementadas:**

**No Frontend (navegador):**
- ✅ Tipos permitidos: PDF, DOC, DOCX
- ✅ Tamanho máximo: 5MB
- ✅ Validação em tempo real

**No Backend (Google Apps Script):**
- ✅ Verificação de MIME type
- ✅ Nomes únicos com timestamp
- ✅ Permissões controladas (apenas visualização)
- ✅ Armazenamento isolado por pasta

### **Privacidade:**
- Arquivos ficam em pasta privada do Google Drive
- Acesso apenas com link (não público)
- Apenas você e pessoas autorizadas podem acessar a pasta

---

## 📊 Estrutura dos Dados

### **Google Sheets:**
| Data/Hora | Nome | Email | Telefone | Link do Currículo | Status |
|-----------|------|-------|----------|-------------------|--------|
| 20/10/2024 15:30 | João Silva | joao@email.com | (99) 99999-9999 | [Link] | Novo |

### **Google Drive:**
```
Phoenix - Currículos Processo Seletivo/
├── Joao_Silva_1729442400000_curriculo.pdf
├── Maria_Santos_1729442500000_cv.docx
└── Pedro_Costa_1729442600000_resume.pdf
```

### **Email de Notificação:**
```
Assunto: Nova Candidatura - Agente Comercial Phoenix

Nova candidatura recebida para o processo seletivo:

📋 DADOS DO CANDIDATO:
• Nome: João Silva
• Email: joao@email.com
• Telefone: (99) 99999-9999

📄 CURRÍCULO:
Link: https://drive.google.com/file/d/...

📅 Data/Hora: 20/10/2024 15:30
```

---

## 🛠️ Manutenção

### **Acessar Currículos:**
1. Abra o Google Drive
2. Navegue até a pasta "Phoenix - Currículos Processo Seletivo"
3. Todos os currículos estarão organizados por nome e timestamp

### **Gerenciar Candidaturas:**
1. Abra a planilha Google Sheets
2. Atualize a coluna "Status" conforme o processo:
   - **Novo** → Candidatura recém-recebida
   - **Em Análise** → Currículo sendo avaliado
   - **Entrevista** → Candidato selecionado para entrevista
   - **Aprovado** → Candidato aprovado
   - **Reprovado** → Candidato não selecionado

### **Baixar Currículos em Lote:**
1. Acesse a pasta no Google Drive
2. Selecione os arquivos desejados
3. Clique com botão direito > "Fazer download"

---

## ⚠️ Troubleshooting

### **Erro: "Arquivo muito grande"**
- Verifique se o arquivo tem menos de 5MB
- Comprima o PDF se necessário

### **Erro: "Tipo de arquivo não permitido"**
- Use apenas PDF, DOC ou DOCX
- Converta outros formatos antes de enviar

### **Arquivo não aparece no Drive**
- Verifique se o `DRIVE_FOLDER_ID` está correto
- Confirme se as permissões foram concedidas ao script

### **Dados não aparecem na planilha**
- Verifique se o `SHEET_ID` está correto
- Execute a função `configurarPlanilha()` novamente

---

## 📞 Suporte

Para problemas técnicos:
- **Email**: phoenixschool10@gmail.com
- **WhatsApp**: (99) 99206-6131

---

## 🎉 Sistema Pronto!

Após seguir todos os passos, seu sistema de upload estará 100% funcional e seguro, armazenando todos os currículos no Google Drive e organizando as candidaturas no Google Sheets.
