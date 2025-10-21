# 🚀 Guia de Deploy - Phoenix Recruitment Landing

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Netlify
- ✅ Conta no Google (para Google Sheets)

## 🔧 Passo 1: Preparar o Repositório GitHub

### 1.1 Criar Repositório
```bash
# No GitHub, criar novo repositório:
# Nome: phoenix-recruitment-landing
# Descrição: Landing page para processo seletivo Phoenix
# Público ou Privado (sua escolha)
```

### 1.2 Upload dos Arquivos
1. Faça upload de todos os arquivos da pasta `phoenix-recruitment-landing`
2. Certifique-se de que a pasta `src` está incluída
3. Verifique se todos os arquivos estão no repositório:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `netlify.toml`
   - `_redirects`
   - `README.md`
   - `package.json`
   - `.gitignore`
   - Pasta `src/` completa

## 🌐 Passo 2: Deploy no Netlify

### 2.1 Conectar Repositório
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com sua conta
3. Clique em "New site from Git"
4. Escolha "GitHub" e autorize a conexão
5. Selecione o repositório `phoenix-recruitment-landing`

### 2.2 Configurar Build Settings
```
Build command: (deixe vazio)
Publish directory: .
```

### 2.3 Deploy
1. Clique em "Deploy site"
2. Aguarde o deploy ser concluído
3. Anote a URL gerada (ex: `https://amazing-name-123456.netlify.app`)

### 2.4 Configurar Domínio Personalizado (Opcional)
1. No painel do Netlify, vá em "Domain settings"
2. Clique em "Add custom domain"
3. Digite seu domínio (ex: `processo-seletivo.phoenixschool.com.br`)
4. Configure os DNS conforme instruções

## 📊 Passo 3: Configurar Google Sheets

### 3.1 Criar Planilha
1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma nova planilha
3. Nomeie como "Phoenix - Processo Seletivo"
4. Adicione os cabeçalhos na primeira linha:
   - A1: `Data/Hora`
   - B1: `Nome`
   - C1: `Email`
   - D1: `Telefone`
   - E1: `Cargo`
   - F1: `Experiência`
   - G1: `Motivação`
   - H1: `Status`

### 3.2 Obter ID da Planilha
1. Na URL da planilha, copie o ID:
   ```
   https://docs.google.com/spreadsheets/d/[ID_DA_PLANILHA]/edit
   ```
2. Anote este ID para usar no próximo passo

### 3.3 Configurar Google Apps Script
1. Acesse [script.google.com](https://script.google.com)
2. Clique em "Novo projeto"
3. Cole o código do arquivo `google-apps-script.js`
4. Substitua `SEU_ID_DA_PLANILHA_AQUI` pelo ID copiado
5. Salve o projeto com nome "Phoenix Recruitment API"

### 3.4 Publicar o Script
1. Clique em "Implantar" > "Nova implantação"
2. Escolha tipo: "Aplicativo da web"
3. Configurações:
   - Executar como: "Eu"
   - Quem tem acesso: "Qualquer pessoa"
4. Clique em "Implantar"
5. Copie a URL do aplicativo web
6. **IMPORTANTE**: Anote esta URL!

### 3.5 Testar o Script
1. No Google Apps Script, execute a função `configurarPlanilha()`
2. Execute a função `testarIntegracao()`
3. Verifique se uma linha de teste foi adicionada na planilha

## 🔗 Passo 4: Conectar Landing Page ao Google Sheets

### 4.1 Atualizar JavaScript
1. No repositório GitHub, edite o arquivo `script.js`
2. Encontre a linha:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
   ```
3. Substitua pela URL copiada do Google Apps Script
4. Faça commit das mudanças

### 4.2 Verificar Deploy Automático
1. O Netlify detectará automaticamente as mudanças
2. Aguarde o novo deploy ser concluído
3. Teste o formulário na landing page

## ✅ Passo 5: Testes Finais

### 5.1 Teste do Formulário
1. Acesse sua landing page
2. Preencha o formulário com dados de teste
3. Envie o formulário
4. Verifique se:
   - Mensagem de sucesso aparece
   - Dados chegam na planilha Google Sheets
   - Email de notificação é enviado (se configurado)

### 5.2 Teste de Responsividade
- ✅ Desktop (1200px+)
- ✅ Tablet (768px-1199px)
- ✅ Mobile (até 767px)

### 5.3 Teste de Performance
1. Use [PageSpeed Insights](https://pagespeed.web.dev/)
2. Verifique se a pontuação está boa (>90)

## 📱 Passo 6: Configurações Adicionais

### 6.1 Google Analytics (Opcional)
1. Crie uma propriedade no Google Analytics
2. Adicione o código de tracking no `<head>` do HTML
3. Faça commit e aguarde deploy

### 6.2 Facebook Pixel (Opcional)
1. Configure o Facebook Pixel
2. Adicione o código no `<head>` do HTML

### 6.3 Notificações por Email
1. No Google Apps Script, configure o email em `EMAIL_RH`
2. Teste enviando uma candidatura

## 🔧 Troubleshooting

### Problema: Fontes não carregam
**Solução**: Verifique se a pasta `src/fonts` foi enviada corretamente

### Problema: Formulário não funciona
**Solução**: 
1. Verifique se o Netlify Forms está ativado
2. Confirme se `data-netlify="true"` está no formulário
3. Teste a URL do Google Apps Script

### Problema: CSS não aplica
**Solução**: 
1. Verifique se `styles.css` está no root
2. Limpe o cache do navegador
3. Verifique console do navegador por erros

### Problema: Imagens não aparecem
**Solução**: 
1. Confirme se pasta `src/assets` existe
2. Verifique caminhos no HTML
3. Use URLs absolutas se necessário

## 📞 Suporte

Para problemas técnicos:
- Email: phoenixschool10@gmail.com
- WhatsApp: (99) 99206-6131

## 🎯 URLs Importantes

- **Landing Page**: `https://seu-site.netlify.app`
- **Planilha**: `https://docs.google.com/spreadsheets/d/[ID]`
- **Apps Script**: `https://script.google.com/d/[ID]`
- **Netlify Admin**: `https://app.netlify.com/sites/[site-name]`

---

**✅ Deploy Concluído!** 

Sua landing page está pronta para receber candidaturas! 🚀
