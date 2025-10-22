# 🔐 Configuração OAuth2 Dropbox - Tokens Permanentes

## **Por que OAuth2?**
- ✅ **Tokens nunca expiram** (renovação automática)
- ✅ **Mais seguro** que tokens estáticos
- ✅ **Produção-ready** sem interrupções

---

## **1. Configurar App Dropbox para OAuth2**

### **1.1 Acessar Dropbox Developers:**
- Vá para: https://www.dropbox.com/developers/apps
- Entre na sua app existente

### **1.2 Configurar OAuth2:**
- Vá em **"Settings"**
- Em **"OAuth 2"**, adicione:
  - **Redirect URIs**: `https://seu-dominio.vercel.app/oauth/callback`
  - **App permissions**: `files.content.write`, `sharing.write`

### **1.3 Anotar credenciais:**
- **App key** (Client ID)
- **App secret** (Client Secret)

---

## **2. Obter Refresh Token (Uma vez só)**

### **2.1 URL de autorização:**
```
https://www.dropbox.com/oauth2/authorize?client_id=SEU_CLIENT_ID&response_type=code&redirect_uri=https://seu-dominio.vercel.app/oauth/callback
```

### **2.2 Trocar código por tokens:**
Após autorizar, você receberá um `code`. Use este comando:

```bash
curl -X POST https://api.dropboxapi.com/oauth2/token \
  -d grant_type=authorization_code \
  -d code=SEU_CODIGO_AQUI \
  -d redirect_uri=https://seu-dominio.vercel.app/oauth/callback \
  -d client_id=SEU_CLIENT_ID \
  -d client_secret=SEU_CLIENT_SECRET
```

**Resposta:**
```json
{
  "access_token": "sl.xxxxxxxxx",
  "refresh_token": "xxxxxxxxx",
  "expires_in": 14400
}
```

---

## **3. Configurar Variáveis no Vercel**

### **Adicionar no Vercel Dashboard:**
```
DROPBOX_CLIENT_ID=sua_app_key
DROPBOX_CLIENT_SECRET=seu_app_secret
DROPBOX_REFRESH_TOKEN=seu_refresh_token
DROPBOX_ACCESS_TOKEN=seu_access_token_inicial
```

---

## **4. Como Funciona**

### **Fluxo Automático:**
1. **Tentativa de upload** com token atual
2. **Se expirado** (401), chama `/api/dropbox-auth`
3. **Renova automaticamente** usando refresh token
4. **Continua upload** com novo token
5. **Zero interrupção** para o usuário

### **Fallback:**
- Se renovação falhar, usa token estático
- Logs de erro para debug
- Sistema continua funcionando

---

## **5. Vantagens**

### **Antes (Token Estático):**
- ❌ Expira em 4 horas
- ❌ Precisa renovar manualmente
- ❌ Site quebra quando expira

### **Depois (OAuth2):**
- ✅ **Renovação automática**
- ✅ **Nunca quebra**
- ✅ **Zero manutenção**
- ✅ **Mais seguro**

---

## **6. Teste**

### **Verificar se está funcionando:**
1. Faça upload de um currículo
2. Se der erro 401, verifique logs do Vercel
3. Deve aparecer: "Token refresh failed, using stored token" ou sucesso

### **Forçar renovação:**
- Delete `DROPBOX_ACCESS_TOKEN` do Vercel temporariamente
- Teste upload - deve renovar automaticamente

---

## **🚀 Resultado Final**

**Tokens nunca mais expiram!** O sistema renova automaticamente em background, sem você precisar fazer nada.

**Configuração única → Funciona para sempre**
