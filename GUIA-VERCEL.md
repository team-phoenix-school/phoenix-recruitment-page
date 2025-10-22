# 🚀 Guia de Deploy no Vercel - Phoenix Recruitment

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [Dropbox](https://dropbox.com) (gratuita - 2GB)
- Conta no Google Cloud com Service Account configurada
- Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 🎯 Passo 1: Configurar Dropbox

### 1.1 Criar Conta
1. Acesse [dropbox.com](https://dropbox.com)
2. Crie uma conta gratuita (2GB grátis)
3. Faça login

### 1.2 Criar App no Dropbox
1. Acesse [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Clique em **"Create app"**
3. Configure:
   - **API**: Dropbox API
   - **Type**: App folder (recomendado) ou Full Dropbox
   - **Name**: `phoenix-recruitment` (ou qualquer nome)
4. Clique em **"Create app"**

### 1.3 Gerar Access Token
1. Na página do app criado
2. Vá para **Settings** → **OAuth 2**
3. Em **"Generated access token"**, clique em **"Generate"**
4. **Copie o token** - você vai precisar dele

---

## 🎯 Passo 2: Configurar Google Cloud

### 2.1 Service Account
Se ainda não tem, siga estes passos:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs:
   - Google Sheets API
   - Google Drive API
4. Crie Service Account:
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Baixe o arquivo JSON com as credenciais

### 2.2 Google Sheets
1. Crie uma planilha no Google Sheets
2. Crie uma aba chamada **"Candidatos"**
3. Adicione os cabeçalhos na primeira linha:
   ```
   Data/Hora | Nome | Email | Telefone | Idade | Link do Currículo
   ```
4. Compartilhe a planilha com o email do Service Account
   - Permissão: **Editor**
5. Copie o ID da planilha da URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

---

## 🎯 Passo 3: Deploy no Vercel

### 3.1 Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab/Bitbucket
3. Clique em **"New Project"**
4. Selecione seu repositório
5. Clique em **"Import"**

### 3.2 Configurar Variáveis de Ambiente
Na tela de configuração do projeto, adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

**Google Sheets:**
```
SHEET_ID=seu-sheet-id-aqui
```

**Google Service Account:**
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```
⚠️ **Cole todo o conteúdo do arquivo JSON em uma linha**

**Cloudinary:**
```
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_UPLOAD_PRESET=phoenix_curriculos
```

#### Variáveis Opcionais:
```
NODE_ENV=production
ALLOWED_ORIGIN=https://seu-dominio-customizado.com
```

### 3.3 Configurações do Build
- **Framework Preset**: `Other`
- **Build Command**: (deixe vazio)
- **Output Directory**: `.`
- **Install Command**: `npm install`

### 3.4 Deploy
1. Clique em **"Deploy"**
2. Aguarde o build finalizar (1-2 minutos)
3. Seu site estará disponível em: `https://seu-projeto.vercel.app`

---

## 🔧 Passo 4: Atualizar o Frontend

Atualize a URL da API no arquivo `script.js`:

```javascript
// Antes (Netlify)
const response = await fetch('https://recrutamento-phoenix.netlify.app/api/submit', {

// Depois (Vercel)
const response = await fetch('https://seu-projeto.vercel.app/api/submit', {
```

Ou use URL relativa (recomendado):
```javascript
const response = await fetch('/api/submit', {
```

---

## ✅ Passo 5: Testar

### 5.1 Teste o Formulário
1. Acesse seu site: `https://seu-projeto.vercel.app`
2. Preencha o formulário
3. Envie uma candidatura de teste

### 5.2 Verificar Logs
1. No Vercel Dashboard, vá para seu projeto
2. Clique em **"Functions"**
3. Clique em **"submit"**
4. Veja os logs em tempo real

### 5.3 Verificar Resultados
1. **Google Sheets**: Verifique se os dados foram salvos
2. **Cloudinary**: Acesse Media Library para ver o arquivo
3. **Link do Currículo**: Clique no link na planilha para testar o download

---

## 🎨 Domínio Customizado (Opcional)

### Adicionar Domínio Próprio
1. No Vercel Dashboard, vá para **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio: `recrutamento.phoenixenglish.com.br`
4. Siga as instruções para configurar DNS

### Configurar DNS
Adicione estes registros no seu provedor de DNS:

**Opção 1 - CNAME (Recomendado):**
```
Type: CNAME
Name: recrutamento
Value: cname.vercel-dns.com
```

**Opção 2 - A Record:**
```
Type: A
Name: recrutamento
Value: 76.76.21.21
```

---

## 🔍 Troubleshooting

### Erro: "Service Accounts do not have storage quota"
✅ **Solução**: Você está usando Cloudinary agora, não Google Drive. Ignore este erro se aparecer nos logs antigos.

### Erro: "CLOUDINARY_CLOUD_NAME não configurado"
✅ **Solução**: 
1. Vá para Vercel Dashboard → Settings → Environment Variables
2. Adicione `CLOUDINARY_CLOUD_NAME` com seu cloud name
3. Redeploy o projeto

### Erro: "Arquivo não abre" ou "Sem formato"
✅ **Solução**: Certifique-se de que o upload preset está como **"Unsigned"**

### Erro 500 no formulário
✅ **Solução**:
1. Verifique os logs no Vercel Functions
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se o Service Account tem permissão na planilha

### CORS Error
✅ **Solução**: Adicione seu domínio nas origens permitidas em `api/submit.js`:
```javascript
const allowedOrigins = [
  'https://seu-dominio.vercel.app',
  'https://seu-dominio-customizado.com',
  'http://localhost:3000'
];
```

---

## 📊 Monitoramento

### Logs em Tempo Real
1. Vercel Dashboard → Seu Projeto
2. **Functions** → **submit**
3. Veja logs de cada requisição

### Analytics
1. Vercel Dashboard → **Analytics**
2. Veja métricas de:
   - Requisições
   - Tempo de resposta
   - Erros
   - Uso de banda

### Limites do Plano Gratuito
- **Bandwidth**: 100GB/mês
- **Function Executions**: 100GB-Hours/mês
- **Function Duration**: 10s por execução
- **Deployments**: Ilimitados

---

## 🚀 Próximos Passos

### Melhorias Recomendadas
1. **Notificações por Email**: Adicionar envio de email ao receber candidatura
2. **Dashboard Admin**: Criar painel para visualizar candidaturas
3. **Filtros e Busca**: Adicionar na planilha Google Sheets
4. **Analytics**: Integrar Google Analytics

### Manutenção
- **Backups**: Google Sheets faz backup automático
- **Cloudinary**: Plano gratuito tem 25GB de storage
- **Vercel**: Monitorar uso mensal no dashboard

---

## 📞 Suporte

**Problemas com:**
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Cloudinary**: [cloudinary.com/support](https://cloudinary.com/support)
- **Google Cloud**: [cloud.google.com/support](https://cloud.google.com/support)

---

## 🎉 Conclusão

Seu sistema de recrutamento está agora rodando no Vercel com:
- ✅ Upload de arquivos via Cloudinary
- ✅ Dados salvos no Google Sheets
- ✅ Deploy automático a cada push
- ✅ HTTPS gratuito
- ✅ Performance otimizada

**Tudo funcionando? Parabéns! 🚀**
