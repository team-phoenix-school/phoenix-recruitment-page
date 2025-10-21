# 🔒 Checklist de Segurança - Phoenix Recruitment

Use este checklist antes de fazer deploy para garantir que tudo está seguro.

## ✅ Antes do Deploy

### Configuração do Google Cloud
- [ ] Service Account criada no Google Cloud Console
- [ ] Google Sheets API ativada no projeto
- [ ] Arquivo JSON de credenciais baixado
- [ ] Email da Service Account anotado

### Configuração do Google Sheets
- [ ] Planilha criada com aba "Candidatos"
- [ ] Cabeçalhos configurados (Data/Hora, Nome, Email, Telefone, Cargo, Experiência, Motivação, Status)
- [ ] Planilha compartilhada com email da Service Account
- [ ] Permissão de "Editor" concedida
- [ ] ID da planilha copiado

### Configuração do Netlify
- [ ] Variável `SHEET_ID` configurada
- [ ] Variável `GOOGLE_SERVICE_ACCOUNT_KEY` configurada (JSON em uma linha)
- [ ] Variável `NODE_ENV` configurada como "production"
- [ ] Build settings configurados (functions = "api")

### Código
- [ ] Arquivo `.env` NÃO está no repositório
- [ ] Arquivo `.env.example` está no repositório
- [ ] `.gitignore` inclui `.env` e arquivos de credenciais
- [ ] Nenhuma credencial hardcoded no código
- [ ] API endpoint configurado como `/api/submit`

## ✅ Após o Deploy

### Testes Funcionais
- [ ] Formulário carrega corretamente
- [ ] Validações do frontend funcionam
- [ ] Mensagens de erro aparecem corretamente
- [ ] Envio de formulário funciona
- [ ] Dados aparecem na planilha do Google Sheets
- [ ] Formato de data/hora está correto
- [ ] Status "Novo" é adicionado automaticamente

### Testes de Segurança
- [ ] Não é possível enviar formulário sem preencher campos obrigatórios
- [ ] Validação de email funciona
- [ ] Validação de telefone funciona
- [ ] Rate limiting funciona (tentar enviar 2x em menos de 30s)
- [ ] Mensagens de erro não expõem detalhes internos
- [ ] HTTPS está ativo (cadeado no navegador)

### Logs e Monitoramento
- [ ] Logs da função aparecem no Netlify Dashboard
- [ ] Erros são registrados corretamente
- [ ] Sucessos são registrados corretamente
- [ ] Não há credenciais nos logs

## ✅ Manutenção Contínua

### Mensal
- [ ] Revisar logs de erro no Netlify
- [ ] Verificar taxa de sucesso de envios
- [ ] Testar formulário manualmente
- [ ] Verificar se a planilha está recebendo dados

### Trimestral
- [ ] Atualizar dependências (`npm update`)
- [ ] Revisar permissões da Service Account
- [ ] Verificar quota de uso da Google Sheets API
- [ ] Testar recuperação de erros

### Anual
- [ ] Considerar rotação de credenciais da Service Account
- [ ] Revisar e atualizar políticas de segurança
- [ ] Fazer backup da planilha
- [ ] Auditar logs de acesso

## 🚨 Em Caso de Problemas

### Credenciais Expostas
Se você acidentalmente commitou credenciais:
1. **IMEDIATAMENTE** revogue a Service Account no Google Cloud
2. Crie uma nova Service Account
3. Atualize as variáveis de ambiente no Netlify
4. Remova o commit com credenciais do histórico do Git
5. Force push para o repositório

### Formulário Não Funciona
1. Verifique os logs no Netlify Dashboard
2. Verifique se as variáveis de ambiente estão configuradas
3. Verifique se a planilha está compartilhada corretamente
4. Teste a API diretamente usando Postman ou curl

### Dados Não Aparecem na Planilha
1. Verifique se o nome da aba é "Candidatos"
2. Verifique se os cabeçalhos estão corretos
3. Verifique se a Service Account tem permissão de Editor
4. Verifique os logs da função no Netlify

## 📞 Contatos de Emergência

- **Netlify Support**: https://www.netlify.com/support/
- **Google Cloud Support**: https://cloud.google.com/support
- **Documentação Google Sheets API**: https://developers.google.com/sheets/api

## 📚 Documentação Relacionada

- [SECURITY-SETUP.md](SECURITY-SETUP.md) - Guia completo de configuração
- [README.md](README.md) - Documentação geral do projeto
- [.env.example](.env.example) - Exemplo de variáveis de ambiente

---

**Última atualização**: 2024
**Versão**: 2.0 (API Segura)

⚠️ **IMPORTANTE**: Este checklist deve ser seguido SEMPRE antes de fazer deploy em produção.
