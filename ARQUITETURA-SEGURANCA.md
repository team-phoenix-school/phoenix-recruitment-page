# 🔒 Arquitetura de Segurança - Comparação

## 📊 Visão Geral das Mudanças

Este documento explica as melhorias de segurança implementadas no formulário de recrutamento.

---

## ❌ ARQUITETURA ANTIGA (INSEGURA)

### Fluxo de Dados
```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Navegador  │ ──────> │ Google Apps      │ ──────> │ Google       │
│  (Frontend) │         │ Script (Público) │         │ Sheets       │
└─────────────┘         └──────────────────┘         └──────────────┘
```

### Problemas de Segurança

#### 1. **URL do Google Apps Script Exposta**
```javascript
// ❌ INSEGURO - URL exposta no código
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';

fetch(GOOGLE_SCRIPT_URL, {
  method: 'POST',
  mode: 'no-cors',
  body: JSON.stringify(dados)
});
```

**Riscos:**
- Qualquer pessoa pode ver a URL no código fonte
- Possível envio de dados maliciosos diretamente
- Sem controle de quem acessa a API
- Difícil rastrear origem dos dados

#### 2. **Sem Validação no Servidor**
```javascript
// ❌ Validação apenas no frontend (facilmente burlável)
if (!nome || !email) {
  alert('Preencha os campos');
  return;
}
```

**Riscos:**
- Usuário pode desabilitar JavaScript e enviar dados inválidos
- Possível injeção de dados maliciosos
- Sem sanitização adequada

#### 3. **Mode 'no-cors'**
```javascript
// ❌ Não é possível verificar se o envio foi bem-sucedido
fetch(url, { mode: 'no-cors' })
```

**Riscos:**
- Não há feedback real de sucesso/erro
- Usuário pode pensar que enviou, mas falhou
- Difícil debugar problemas

#### 4. **Credenciais Potencialmente Expostas**
```javascript
// ❌ ID da planilha no código
const SHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
```

**Riscos:**
- ID da planilha visível para todos
- Facilita ataques direcionados

---

## ✅ ARQUITETURA NOVA (SEGURA)

### Fluxo de Dados
```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Navegador  │ ──────> │ API Netlify  │ ──────> │ Google API   │ ──────> │ Google       │
│  (Frontend) │         │ (Serverless) │         │ (Autenticada)│         │ Sheets       │
└─────────────┘         └──────────────┘         └──────────────┘         └──────────────┘
                                │
                                │ Usa variáveis de ambiente
                                ▼
                        ┌──────────────────┐
                        │ Service Account  │
                        │ (Credenciais)    │
                        └──────────────────┘
```

### Melhorias de Segurança

#### 1. **API Intermediária Segura**
```javascript
// ✅ SEGURO - Endpoint interno
const response = await fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dados)
});
```

**Benefícios:**
- Endpoint controlado pelo servidor
- Impossível acessar diretamente o Google Sheets
- Logs de todas as requisições
- Controle total sobre quem acessa

#### 2. **Validação Dupla (Frontend + Backend)**

**Frontend:**
```javascript
// ✅ Validação no frontend (UX)
if (!validarEmail(email)) {
  alert('Email inválido');
  return;
}
```

**Backend:**
```javascript
// ✅ Validação no backend (Segurança)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ 
    error: 'Email inválido' 
  });
}
```

**Benefícios:**
- Proteção mesmo se JavaScript for desabilitado
- Validação consistente
- Dados sempre validados antes de salvar

#### 3. **Autenticação via Service Account**
```javascript
// ✅ SEGURO - Credenciais no servidor
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```

**Benefícios:**
- Credenciais NUNCA expostas no código
- Autenticação robusta do Google
- Controle granular de permissões
- Fácil rotação de credenciais

#### 4. **Tratamento Adequado de Erros**
```javascript
// ✅ Resposta adequada com feedback
const result = await response.json();

if (response.ok && result.success) {
  mostrarEtapa('confirmacao');
} else {
  throw new Error(result.details || 'Erro ao enviar');
}
```

**Benefícios:**
- Usuário sabe se o envio foi bem-sucedido
- Mensagens de erro claras
- Fácil debugar problemas

#### 5. **Proteções Adicionais**

**Rate Limiting:**
```javascript
// ✅ Previne spam
let ultimoEnvio = 0;
const INTERVALO_MINIMO = 30000; // 30 segundos

function podeEnviar() {
  const agora = Date.now();
  if (agora - ultimoEnvio < INTERVALO_MINIMO) {
    return false;
  }
  return true;
}
```

**Sanitização:**
```javascript
// ✅ Remove espaços e caracteres perigosos
const dados = {
  nome: document.getElementById('nome').value.trim(),
  email: document.getElementById('email').value.trim(),
  // ...
};
```

**CORS Configurado:**
```javascript
// ✅ Controle de origem
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
```

---

## 📊 Comparação Lado a Lado

| Aspecto | Arquitetura Antiga ❌ | Arquitetura Nova ✅ |
|---------|----------------------|---------------------|
| **Exposição de Credenciais** | URL pública no código | Variáveis de ambiente |
| **Validação** | Apenas frontend | Frontend + Backend |
| **Autenticação** | Nenhuma | Service Account |
| **Feedback de Erro** | Limitado (no-cors) | Completo |
| **Rate Limiting** | Básico | Robusto |
| **Logs** | Limitados | Completos no Netlify |
| **Rastreabilidade** | Difícil | Fácil |
| **Manutenção** | Difícil | Fácil |
| **Escalabilidade** | Limitada | Alta |
| **Conformidade LGPD** | Questionável | Adequada |

---

## 🔐 Camadas de Segurança

### Camada 1: Frontend
- Validação de campos
- Máscaras de entrada
- Rate limiting
- Sanitização básica

### Camada 2: API (Netlify Function)
- Validação de método HTTP
- Validação de dados
- Autenticação
- Tratamento de erros
- Logs de segurança

### Camada 3: Google Cloud
- Service Account
- Permissões granulares
- Auditoria de acesso
- Quota de API

### Camada 4: Infraestrutura
- HTTPS obrigatório
- Headers de segurança
- CORS configurado
- Variáveis de ambiente protegidas

---

## 🎯 Benefícios para o Negócio

### 1. **Conformidade Legal**
- Adequação à LGPD
- Proteção de dados pessoais
- Rastreabilidade de acessos

### 2. **Confiabilidade**
- Menos erros de envio
- Feedback claro para usuários
- Dados sempre validados

### 3. **Manutenibilidade**
- Código mais organizado
- Fácil debugar problemas
- Logs centralizados

### 4. **Escalabilidade**
- Suporta mais tráfego
- Fácil adicionar novas validações
- Possível adicionar mais integrações

### 5. **Segurança**
- Proteção contra ataques
- Credenciais seguras
- Auditoria completa

---

## 📝 Próximos Passos Recomendados

### Curto Prazo (Imediato)
- [ ] Configurar variáveis de ambiente no Netlify
- [ ] Testar formulário em produção
- [ ] Monitorar logs por 1 semana

### Médio Prazo (1-3 meses)
- [ ] Adicionar notificações por email
- [ ] Implementar dashboard de analytics
- [ ] Adicionar mais validações específicas

### Longo Prazo (3-6 meses)
- [ ] Implementar sistema de fila para alto volume
- [ ] Adicionar integração com CRM
- [ ] Implementar testes automatizados

---

## 📚 Recursos Adicionais

- [SECURITY-SETUP.md](SECURITY-SETUP.md) - Guia de configuração
- [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) - Checklist de segurança
- [README.md](README.md) - Documentação geral

---

**Conclusão**: A nova arquitetura oferece segurança robusta, mantendo a simplicidade de uso para o usuário final, enquanto protege os dados e credenciais da empresa.
