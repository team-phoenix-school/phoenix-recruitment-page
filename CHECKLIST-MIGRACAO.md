# ✅ Checklist de Migração - Netlify → Vercel

## 📋 Antes de Começar

- [ ] Conta no Vercel criada
- [ ] Conta no Cloudinary criada
- [ ] Código commitado no Git
- [ ] Backup das variáveis de ambiente do Netlify

---

## 🎯 Passo 1: Configurar Cloudinary (10 minutos)

- [ ] Criar conta no [Cloudinary](https://cloudinary.com)
- [ ] Criar upload preset `phoenix_curriculos`
- [ ] Configurar como **Unsigned**
- [ ] Anotar **Cloud Name**

---

## 🎯 Passo 2: Preparar Código (Já feito! ✅)

- [x] API adaptada para formato Vercel
- [x] Arquivo `vercel.json` criado
- [x] README atualizado
- [x] Guia completo criado

---

## 🎯 Passo 3: Deploy no Vercel (5 minutos)

- [ ] Acessar [vercel.com](https://vercel.com)
- [ ] Conectar repositório GitHub
- [ ] Importar projeto
- [ ] Configurar variáveis de ambiente:
  - [ ] `SHEET_ID`
  - [ ] `GOOGLE_SERVICE_ACCOUNT_KEY`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_UPLOAD_PRESET`
- [ ] Fazer deploy

---

## 🎯 Passo 4: Testar (5 minutos)

- [ ] Acessar site no Vercel
- [ ] Preencher formulário de teste
- [ ] Verificar dados no Google Sheets
- [ ] Verificar arquivo no Cloudinary
- [ ] Testar download do arquivo
- [ ] Verificar logs no Vercel Functions

---

## 🎯 Passo 5: Atualizar Domínio (Opcional)

- [ ] Adicionar domínio customizado no Vercel
- [ ] Configurar DNS
- [ ] Aguardar propagação (até 24h)
- [ ] Testar com domínio customizado

---

## 🎯 Passo 6: Desativar Netlify (Após confirmar que tudo funciona)

- [ ] Pausar site no Netlify
- [ ] Remover variáveis de ambiente sensíveis
- [ ] Manter como backup por 1 semana
- [ ] Deletar site do Netlify (opcional)

---

## 🔍 Troubleshooting

### ❌ Erro: "CLOUDINARY_CLOUD_NAME não configurado"
**Solução**: Adicionar variável no Vercel e redeploy

### ❌ Erro: "Arquivo não abre"
**Solução**: Verificar se upload preset está como "Unsigned"

### ❌ Erro 500
**Solução**: Verificar logs no Vercel Functions

### ❌ CORS Error
**Solução**: Adicionar domínio nas origens permitidas em `api/submit.js`

---

## 📊 Após a Migração

### Monitorar por 1 semana:
- [ ] Verificar logs diários
- [ ] Confirmar que todos os envios funcionam
- [ ] Verificar uso de recursos no Vercel
- [ ] Verificar uso de storage no Cloudinary

### Limpar:
- [ ] Remover arquivos do Netlify (se não precisar mais)
- [ ] Atualizar documentação interna
- [ ] Informar equipe sobre nova URL

---

## 🎉 Migração Completa!

Seu sistema agora está rodando no Vercel com:
- ✅ Melhor performance
- ✅ Deploy mais rápido
- ✅ Upload de arquivos funcionando
- ✅ Logs mais detalhados
- ✅ Analytics integrado

**Tudo funcionando? Parabéns! 🚀**
