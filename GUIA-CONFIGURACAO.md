# 🚀 Guia Completo de Configuração - Phoenix Recruitment

## 📋 Visão Geral

Este projeto é um formulário de recrutamento seguro que:
- Coleta: Nome, Email, Telefone, Idade e Currículo (PDF/DOC/DOCX)
- Salva dados no Google Sheets
- Faz upload de currículos no Google Drive
- Usa API segura via Netlify Functions

---

## 🎯 Estrutura da Planilha

A planilha terá **6 colunas**:

```
A1: Data/Hora
B1: Nome
C1: Email
D1: Telefone
E1: Idade
F1: Link do Currículo
```

---

## 🔧 Passo 1: Configurar Google Cloud

### 1.1 Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em **"Criar Projeto"**
3. Nome: `Phoenix Recruitment`
4. Clique em **"Criar"**

### 1.2 Ativar APIs Necessárias

1. No menu lateral: **APIs & Services** → **Library**
2. Procure e ative as seguintes APIs:
   - ✅ **Google Sheets API**
   - ✅ **Google Drive API**

### 1.3 Criar Service Account

1. Menu: **IAM & Admin** → **Service Accounts**
2. Clique em **"Create Service Account"**
3. Preencha:
   - **Nome**: `phoenix-recruitment-api`
   - **Descrição**: `Service account para formulário de recrutamento`
4. Clique em **"Create and Continue"**
5. **NÃO** adicione roles (pule esta etapa)
6. Clique em **"Done"**

### 1.4 Baixar Chave JSON

1. Clique na Service Account criada
2. Aba **"Keys"**
3. **"Add Key"** → **"Create new key"**
4. Tipo: **JSON**
5. Clique em **"Create"**
6. O arquivo JSON será baixado automaticamente
7. **GUARDE ESTE ARQUIVO COM SEGURANÇA!**

---

## 📊 Passo 2: Configurar Google Sheets

### 2.1 Criar Planilha

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma nova planilha
3. Nome: **"Phoenix - Candidaturas"**
4. Renomeie a aba para: **"Candidatos"**

### 2.2 Copiar ID da Planilha

Na URL da planilha, copie o ID:
```
https://docs.google.com/spreadsheets/d/[COPIE_ESTE_ID]/edit
```

Exemplo:
```
https://docs.google.com/spreadsheets/d/1abc123XYZ456/edit
                                      ↑
                                   Este é o ID
```

### 2.3 Configurar Cabeçalhos

Na aba "Candidatos", adicione os cabeçalhos na linha 1:

| A1 | B1 | C1 | D1 | E1 | F1 |
|----|----|----|----|----|-----|
| Data/Hora | Nome | Email | Telefone | Idade | Link do Currículo |

### 2.4 Compartilhar com Service Account

1. Clique em **"Compartilhar"** (botão verde no canto superior direito)
2. Cole o email da Service Account
   - Está no arquivo JSON baixado, campo `client_email`
   - Exemplo: `phoenix-recruitment-api@seu-projeto.iam.gserviceaccount.com`
3. Permissão: **Editor**
4. **DESMARQUE** "Notificar pessoas"
5. Clique em **"Compartilhar"**

---

## 📁 Passo 3: Configurar Google Drive

### 3.1 Criar Pasta para Currículos

1. Acesse [drive.google.com](https://drive.google.com)
2. Clique em **"Novo"** → **"Nova pasta"**
3. Nome: **"Phoenix - Currículos"**
4. Clique em **"Criar"**

### 3.2 Copiar ID da Pasta

1. Abra a pasta criada
2. Na URL, copie o ID:
```
https://drive.google.com/drive/folders/[COPIE_ESTE_ID]
```

### 3.3 Compartilhar Pasta com Service Account

1. Clique com botão direito na pasta
2. **"Compartilhar"**
3. Cole o email da Service Account (mesmo do passo 2.4)
4. Permissão: **Editor**
5. **DESMARQUE** "Notificar pessoas"
6. Clique em **"Compartilhar"**

---

## 🌐 Passo 4: Configurar Netlify

### 4.1 Fazer Deploy Inicial

1. Faça commit do código:
```bash
git add .
git commit -m "feat: configurar formulário de recrutamento"
git push origin main
```

2. Acesse [app.netlify.com](https://app.netlify.com)
3. Clique em **"Add new site"** → **"Import an existing project"**
4. Conecte seu repositório GitHub
5. Aguarde o deploy inicial

### 4.2 Configurar Variáveis de Ambiente

1. No Netlify Dashboard, vá em **Site settings** → **Environment variables**
2. Clique em **"Add a variable"**
3. Adicione as 4 variáveis abaixo:

#### Variável 1: SHEET_ID
- **Key**: `SHEET_ID`
- **Value**: O ID da planilha copiado no passo 2.2

#### Variável 2: DRIVE_FOLDER_ID
- **Key**: `DRIVE_FOLDER_ID`
- **Value**: O ID da pasta do Drive copiado no passo 3.2

#### Variável 3: GOOGLE_SERVICE_ACCOUNT_KEY
- **Key**: `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: O conteúdo completo do arquivo JSON baixado no passo 1.4

**⚠️ IMPORTANTE**: Cole o JSON em uma única linha!

Para minificar o JSON:
1. Abra o arquivo JSON em um editor de texto
2. Copie todo o conteúdo
3. Acesse: https://www.jsonformatter.io/json-minify
4. Cole o JSON e clique em "Minify"
5. Copie o resultado e cole no Netlify

#### Variável 4: NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`

4. Clique em **"Save"** para cada variável

### 4.3 Fazer Redeploy

1. Vá em **Deploys**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde o build completar

---

## ✅ Passo 5: Testar

### 5.1 Teste Completo

1. Acesse seu site publicado
2. Preencha o formulário:
   - Nome completo
   - Email válido
   - Telefone no formato (XX) XXXXX-XXXX
   - Idade entre 16 e 99
   - Anexe um currículo (PDF, DOC ou DOCX até 5MB)
   - Marque o checkbox
3. Clique em **"Enviar Candidatura"**
4. Aguarde a mensagem de sucesso

### 5.2 Verificar Dados

1. **Google Sheets**: Verifique se os dados apareceram na planilha
2. **Google Drive**: Verifique se o currículo foi salvo na pasta
3. **Link**: O link na coluna F deve abrir o currículo

---

## 🔒 Segurança Implementada

✅ **Validação Dupla**: Frontend + Backend  
✅ **Sanitização**: Proteção contra XSS  
✅ **CORS Restritivo**: Apenas origens permitidas  
✅ **Rate Limiting**: Proteção contra spam  
✅ **Credenciais Seguras**: Variáveis de ambiente  
✅ **Headers de Segurança**: X-Frame-Options, X-XSS-Protection  
✅ **Validação de Arquivo**: Tipo e tamanho  
✅ **Autenticação**: Google Service Account  

---

## 🐛 Solução de Problemas

### Erro: "Credenciais não configuradas"
- Verifique se as variáveis de ambiente estão corretas no Netlify
- Certifique-se de que o JSON está em uma única linha

### Erro: "Permissão negada" no Sheets/Drive
- Verifique se compartilhou a planilha e pasta com o email da Service Account
- Certifique-se de que deu permissão de **Editor**

### Erro: "API não ativada"
- Volte ao Google Cloud Console
- Verifique se ativou Google Sheets API e Google Drive API

### Currículo não aparece no Drive
- Verifique o ID da pasta do Drive
- Confirme que a pasta foi compartilhada com a Service Account

### Formulário não envia
- Abra o Console do navegador (F12)
- Verifique se há erros JavaScript
- Teste se o arquivo tem menos de 5MB

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Netlify: **Functions** → **Logs**
2. Verifique o Console do navegador (F12)
3. Revise cada passo deste guia

---

## 📚 Estrutura de Arquivos

```
phoenix-recruitment-page/
├── api/
│   └── submit.js           # API serverless (Netlify Function)
├── src/
│   ├── assets/             # Imagens e logos
│   └── fonts/              # Fontes customizadas
├── index.html              # Página principal
├── script.js               # JavaScript do formulário
├── styles.css              # Estilos CSS
├── config.js               # Configurações
├── netlify.toml            # Configuração do Netlify
├── package.json            # Dependências
├── .gitignore              # Arquivos ignorados pelo Git
├── .env.example            # Template de variáveis de ambiente
└── GUIA-CONFIGURACAO.md    # Este arquivo
```

---

**Última atualização**: 2024  
**Versão**: 2.0  
**Status**: ✅ Pronto para produção
