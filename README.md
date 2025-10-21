# Phoenix - Landing Page Processo Seletivo

Landing page simplificada para processo seletivo da Phoenix English School.

## 🚀 Características

- **Design responsivo** baseado no estilo original da Phoenix
- **Formulário integrado** com API segura via Netlify Functions
- **Autenticação segura** com Google Service Account
- **Cores e fontes** mantidas do design original
- **Otimizada para conversão** de candidatos
- **Proteção contra spam** com rate limiting e validações

## 📋 Seções Incluídas

- ✅ Header com logo Phoenix
- ✅ Hero section com call-to-action
- ✅ Sobre o processo seletivo
- ✅ Formulário de candidatura
- ✅ Informações de contato
- ✅ Links para redes sociais
- ✅ Footer

## 🛠️ Configuração

### Deploy no Netlify

1. Faça upload dos arquivos para um repositório GitHub
2. Conecte o repositório ao Netlify
3. O site será automaticamente deployado
4. Os formulários serão processados pelo Netlify Forms

### Integração com Google Sheets (API Segura)

Esta landing page usa uma **API segura via Netlify Functions** com autenticação Google Service Account.

#### ⚠️ Configuração Obrigatória

Para o formulário funcionar, você DEVE configurar as variáveis de ambiente no Netlify.

**📖 Consulte o arquivo [SECURITY-SETUP.md](SECURITY-SETUP.md) para instruções detalhadas.**

#### Resumo Rápido:

1. **Criar Service Account no Google Cloud**
   - Ativar Google Sheets API
   - Criar credenciais de Service Account
   - Baixar arquivo JSON com as credenciais

2. **Configurar Google Sheets**
   - Criar planilha com aba "Candidatos"
   - Compartilhar com email da Service Account
   - Adicionar cabeçalhos: Data/Hora, Nome, Email, Telefone, Cargo, Experiência, Motivação, Status

3. **Configurar Variáveis de Ambiente no Netlify**
   - `SHEET_ID`: ID da planilha
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: Conteúdo do JSON (em uma linha)
   - `NODE_ENV`: production

4. **Deploy**
   - Fazer push para o repositório
   - Netlify fará o build automaticamente

#### 🔒 Por que esta arquitetura é mais segura?

- ✅ Credenciais protegidas no servidor (não expostas no código)
- ✅ Validação de dados no backend
- ✅ Autenticação via Service Account
- ✅ Rate limiting e proteção contra spam
- ✅ Logs de segurança
- ✅ Tratamento adequado de erros

## 🎨 Personalização

### Cores
As cores principais estão definidas no CSS:
- `--phoenix-magenta: #A70240`
- `--phoenix-black: #000000`
- `--phoenix-white: #ffffff`

### Fontes
- **Títulos**: Axiforma (Bold)
- **Corpo**: Acumin Variable Concept

### Imagens
- Logo: `src/assets/logo-phoenix.png`
- Background: URL externa do repositório original

## 📱 Responsividade

O site é totalmente responsivo e otimizado para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## 🔒 Segurança

### Frontend
- ✅ Validação de campos obrigatórios
- ✅ Validação de formato de email e telefone
- ✅ Rate limiting (30 segundos entre envios)
- ✅ Sanitização de dados (trim)
- ✅ Máscaras de entrada

### Backend (API)
- ✅ Autenticação via Google Service Account
- ✅ Validação de dados no servidor
- ✅ Validação de método HTTP (apenas POST)
- ✅ Tratamento seguro de erros
- ✅ Logs de segurança
- ✅ Variáveis de ambiente protegidas

### Infraestrutura
- ✅ Headers de segurança configurados no Netlify
- ✅ HTTPS obrigatório
- ✅ CORS configurado
- ✅ Credenciais nunca expostas no código

## 📊 Analytics

Para adicionar analytics, inclua o código do Google Analytics no `<head>` do HTML.

## 🚀 Deploy

### Netlify (Recomendado)

1. Conecte seu repositório GitHub ao Netlify
2. Configure as build settings:
   - Build command: (deixe vazio)
   - Publish directory: `.`
3. Deploy automático a cada push

### Outras Opções

- **Vercel**: Também suporta formulários
- **GitHub Pages**: Apenas arquivos estáticos
- **Hospedagem tradicional**: Upload via FTP

## 📞 Suporte

Para dúvidas sobre a implementação:
- Email: phoenixschool10@gmail.com
- WhatsApp: (99) 99206-6131

---

**Phoenix English School** - Transformando vidas através do inglês 🚀
