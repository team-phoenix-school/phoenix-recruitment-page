# Phoenix - Landing Page Processo Seletivo

Landing page simplificada para processo seletivo da Phoenix English School.

## 🚀 Características

- **Design responsivo** baseado no estilo original da Phoenix
- **Formulário integrado** com API segura via Vercel Functions
- **Upload de arquivos** via Cloudinary (gratuito)
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

### Deploy no Vercel (Recomendado)

**📖 Consulte o arquivo [GUIA-VERCEL.md](GUIA-VERCEL.md) para instruções completas de deploy.**

#### Resumo Rápido:

1. Faça upload dos arquivos para um repositório GitHub
2. Conecte o repositório ao Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Integração com Google Sheets + Cloudinary

Esta landing page usa:
- **Vercel Functions** para API segura
- **Cloudinary** para upload de arquivos (gratuito)
- **Google Service Account** para autenticação
- **Google Sheets** para armazenar dados

#### ⚠️ Configuração Obrigatória

Para o formulário funcionar, você DEVE configurar as variáveis de ambiente no Vercel.

**📖 Consulte o arquivo [GUIA-VERCEL.md](GUIA-VERCEL.md) para instruções detalhadas.**

#### Variáveis de Ambiente Necessárias:

**Google:**
- `SHEET_ID`: ID da planilha Google Sheets
- `GOOGLE_SERVICE_ACCOUNT_KEY`: Credenciais do Service Account (JSON)

**Cloudinary:**
- `CLOUDINARY_CLOUD_NAME`: Nome da sua conta Cloudinary
- `CLOUDINARY_UPLOAD_PRESET`: Nome do upload preset (ex: `phoenix_curriculos`)

**Opcional:**
- `NODE_ENV`: production
- `ALLOWED_ORIGIN`: Domínio customizado

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

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

**Vantagens do Vercel:**
- ✅ Deploy automático
- ✅ HTTPS gratuito
- ✅ Serverless Functions integradas
- ✅ Edge Network global
- ✅ Analytics incluído

### Outras Opções

- **Netlify**: Também funciona (requer adaptação do código)
- **GitHub Pages**: Não suporta serverless functions
- **Hospedagem tradicional**: Requer servidor Node.js

## 📞 Suporte

Para dúvidas sobre a implementação:
- Email: phoenixschool10@gmail.com
- WhatsApp: (99) 99206-6131

---

**Phoenix English School** - Transformando vidas através do inglês 🚀
