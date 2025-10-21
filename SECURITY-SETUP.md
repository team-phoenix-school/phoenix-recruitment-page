# 🔒 Configuração de Segurança - Phoenix Recruitment

Este documento explica como configurar a segurança do formulário de recrutamento usando a API segura com Google Service Account.

## 📋 Visão Geral

A nova arquitetura de segurança protege suas credenciais do Google Sheets usando:

1. **Netlify Functions** - API serverless que processa os dados
2. **Google Service Account** - Autenticação segura sem expor credenciais
3. **Variáveis de ambiente** - Credenciais armazenadas de forma segura no servidor

## 🔐 Diferenças entre a Arquitetura Antiga e Nova

### ❌ Arquitetura Antiga (INSEGURA)
```
Formulário → Google Apps Script (URL pública)
```
- Qualquer pessoa pode enviar dados diretamente
- Sem validação no servidor
- URL do script exposta no código

### ✅ Arquitetura Nova (SEGURA)
```
Formulário → API Netlify (/api/submit) → Google Sheets
```
- Validação no servidor
- Credenciais protegidas por variáveis de ambiente
- Rate limiting e proteção contra spam
- Autenticação via Service Account

## 🚀 Passo a Passo de Configuração

### 1. Criar Service Account no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**:
   - Menu → APIs & Services → Library
   - Procure por "Google Sheets API"
   - Clique em "Enable"

4. Crie uma Service Account:
   - Menu → IAM & Admin → Service Accounts
   - Clique em "Create Service Account"
   - Nome: `phoenix-recruitment-api`
   - Descrição: `Service account para API de recrutamento`
   - Clique em "Create and Continue"
   - Não precisa adicionar roles
   - Clique em "Done"

5. Crie e baixe a chave JSON:
   - Clique na service account criada
   - Aba "Keys"
   - "Add Key" → "Create new key"
   - Tipo: JSON
   - Clique em "Create"
   - O arquivo JSON será baixado automaticamente

### 2. Configurar Google Sheets

1. Abra sua planilha do Google Sheets
2. Copie o ID da planilha da URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
   ```

3. Compartilhe a planilha com a Service Account:
   - Clique em "Compartilhar" na planilha
   - Cole o email da service account (está no arquivo JSON baixado, campo `client_email`)
   - Exemplo: `phoenix-recruitment-api@seu-projeto.iam.gserviceaccount.com`
   - Dê permissão de **Editor**
   - Clique em "Enviar"

4. Configure os cabeçalhos da planilha (aba "Candidatos"):
   ```
   A1: Data/Hora
   B1: Nome
   C1: Email
   D1: Telefone
   E1: Idade
   F1: Cargo
   G1: Experiência
   H1: Motivação
   I1: Status
   ```

### 3. Configurar Variáveis de Ambiente no Netlify

1. Acesse seu site no [Netlify Dashboard](https://app.netlify.com/)
2. Vá em **Site settings** → **Environment variables**
3. Adicione as seguintes variáveis:

#### `SHEET_ID`
- **Key**: `SHEET_ID`
- **Value**: O ID da sua planilha (copiado no passo 2.2)

#### `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Key**: `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: O conteúdo completo do arquivo JSON baixado no passo 1.5
- ⚠️ **IMPORTANTE**: Cole o JSON inteiro em uma única linha, sem quebras de linha

Exemplo do JSON (minificado):
```json
{"type":"service_account","project_id":"seu-projeto","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"phoenix-recruitment-api@seu-projeto.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

#### `NODE_ENV`
- **Key**: `NODE_ENV`
- **Value**: `production`

#### `ALLOWED_ORIGIN` (Opcional - apenas para desenvolvimento local)
- **Key**: `ALLOWED_ORIGIN`
- **Value**: `http://localhost:3000` (ou sua URL de desenvolvimento)
- ⚠️ **NOTA**: Em produção, as origens permitidas já estão configuradas no código

4. Clique em "Save" para cada variável

### 4. Deploy da Aplicação

1. Faça commit das mudanças:
   ```bash
   git add .
   git commit -m "feat: adicionar API segura com Service Account"
   git push origin main
   ```

2. O Netlify fará o deploy automaticamente
3. Aguarde o build completar

### 5. Testar a Integração

1. Acesse seu site publicado
2. Preencha o formulário de candidatura
3. Envie os dados
4. Verifique se os dados aparecem na planilha do Google Sheets

## 🔍 Validações de Segurança Implementadas

### No Frontend (`script.js`)
- ✅ Validação de campos obrigatórios
- ✅ Validação de formato de email
- ✅ Validação de formato de telefone brasileiro
- ✅ Validação de idade (16-99 anos)
- ✅ Rate limiting (30 segundos entre envios)
- ✅ Sanitização de dados (trim)

### No Backend (`api/submit.js`)
- ✅ Validação de método HTTP (apenas POST)
- ✅ Validação de campos obrigatórios
- ✅ Validação de formato de email (regex rigoroso)
- ✅ Validação de formato de telefone (regex)
- ✅ Validação de idade (16-99 anos)
- ✅ Validação de comprimento de campos (min/max)
- ✅ Sanitização contra XSS (remove caracteres perigosos)
- ✅ Limite de tamanho de payload (50KB)
- ✅ CORS restritivo (apenas origens permitidas)
- ✅ Headers de segurança (X-Frame-Options, X-XSS-Protection, etc)
- ✅ Autenticação via Service Account
- ✅ Tratamento de erros
- ✅ Logs de segurança (sem dados sensíveis)
- ✅ Não expõe detalhes internos em produção
- ✅ Normalização de email (lowercase)

## 🛡️ Boas Práticas de Segurança

### ✅ O que FAZER:
- Manter as variáveis de ambiente sempre no Netlify (nunca no código)
- Usar HTTPS para todas as requisições
- Monitorar logs de erro no Netlify
- Revisar permissões da Service Account periodicamente
- Manter a biblioteca `googleapis` atualizada

### ❌ O que NÃO FAZER:
- ❌ Nunca commitar o arquivo `.env` com credenciais reais
- ❌ Nunca expor a chave da Service Account no código
- ❌ Nunca compartilhar a planilha publicamente
- ❌ Nunca desabilitar as validações de segurança

## 🔧 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"
**Solução**: Verifique se `GOOGLE_SERVICE_ACCOUNT_KEY` e `SHEET_ID` estão configurados no Netlify.

### Erro: "Erro ao enviar para a planilha"
**Solução**: 
1. Verifique se a planilha foi compartilhada com o email da Service Account
2. Verifique se a aba se chama "Candidatos"
3. Verifique se os cabeçalhos estão corretos

### Erro: "Email inválido" ou "Telefone inválido"
**Solução**: Verifique se os dados estão no formato correto:
- Email: `usuario@dominio.com`
- Telefone: `(99) 99999-9999`

### Formulário não envia
**Solução**:
1. Abra o Console do navegador (F12)
2. Veja se há erros no console
3. Verifique a aba "Network" para ver a resposta da API
4. Verifique os logs no Netlify Dashboard

## 📊 Monitoramento

### Logs no Netlify
1. Acesse seu site no Netlify Dashboard
2. Vá em **Functions** → **submit**
3. Veja os logs de execução

### Métricas Importantes
- Taxa de sucesso de envios
- Erros de validação
- Tempo de resposta da API
- Uso de quota do Google Sheets API

## 🔄 Atualizações Futuras

Para manter a segurança sempre atualizada:

1. **Atualizar dependências**:
   ```bash
   npm update googleapis
   ```

2. **Revisar logs mensalmente**
3. **Testar formulário após cada deploy**
4. **Rotacionar credenciais anualmente**

## 📞 Suporte

Se tiver problemas com a configuração:
1. Verifique este documento primeiro
2. Consulte a [documentação do Netlify Functions](https://docs.netlify.com/functions/overview/)
3. Consulte a [documentação do Google Sheets API](https://developers.google.com/sheets/api)

---

**Última atualização**: 2024
**Versão**: 2.0 (API Segura)
