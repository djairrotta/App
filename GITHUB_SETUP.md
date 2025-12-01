# 🔗 Guia Completo: Conectar Projeto com GitHub

## 📦 GitHub CLI Instalado com Sucesso!

O GitHub CLI (gh) está instalado e pronto para usar.

---

## 🚀 Opção 1: Autenticação com GitHub CLI (Recomendado)

### Passo 1: Autenticar
```bash
gh auth login
```

**Escolha as opções:**
1. GitHub.com
2. HTTPS (recomendado) ou SSH
3. Login with a web browser ou Paste an authentication token

**Se escolher token:**
- Vá em: https://github.com/settings/tokens
- Clique em "Generate new token (classic)"
- Marque: `repo` (acesso completo)
- Copie o token gerado
- Cole no terminal

### Passo 2: Verificar Autenticação
```bash
gh auth status
```

---

## 📁 Opção 2: Criar Novo Repositório e Enviar Código

### 2.1: Criar repositório no GitHub
```bash
cd /app
gh repo create consultar-processos --private --description "Sistema de Consulta de Processos Jurídicos"
```

### 2.2: Inicializar Git e fazer primeiro commit
```bash
cd /app
git init
git add .
git commit -m "Initial commit: Sistema completo de consulta de processos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/consultar-processos.git
git push -u origin main
```

---

## 🔄 Opção 3: Conectar a Repositório Existente

Se você já tem um repositório:

```bash
cd /app
git init
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git add .
git commit -m "Deploy: Sistema de consulta de processos"
git branch -M main
git push -u origin main
```

---

## 🔑 Opção 4: Usar Token Pessoal (PAT) Diretamente

### Passo 1: Criar Token
1. Acesse: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Nome: `emergent-consultar-processos`
4. Marque: ✅ `repo` (Full control of private repositories)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você não verá novamente!)

### Passo 2: Configurar Git com Token
```bash
cd /app
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Salvar credenciais
git config --global credential.helper store
```

### Passo 3: Primeiro Push (vai pedir credenciais)
```bash
cd /app
git init
git add .
git commit -m "Sistema completo de consulta de processos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Quando pedir senha, **cole o TOKEN** (não a senha da conta).

---

## 🔧 Comandos Úteis

### Ver status do repositório
```bash
cd /app
git status
```

### Fazer commit de alterações
```bash
cd /app
git add .
git commit -m "Descrição da alteração"
git push
```

### Ver histórico
```bash
git log --oneline
```

### Criar nova branch
```bash
git checkout -b feature/nova-funcionalidade
git push -u origin feature/nova-funcionalidade
```

### Voltar para main
```bash
git checkout main
```

---

## 📋 .gitignore Recomendado

Crie o arquivo `/app/.gitignore`:

```
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd

# Environment
.env
*.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.sqlite
*.db

# Uploads e Storage
backend/uploads/*
backend/storage/*
!backend/uploads/.gitkeep
!backend/storage/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
frontend/build/
frontend/dist/
*.tgz
```

---

## 🎯 Estrutura Recomendada de Commits

### Por funcionalidade:
```bash
git commit -m "feat: Adiciona sistema de autenticação admin"
git commit -m "feat: Implementa webhook WhatsApp"
git commit -m "feat: Sistema de agendamento de horários"
git commit -m "fix: Corrige erro no upload de documentos"
git commit -m "docs: Atualiza documentação de integração"
```

---

## ⚠️ Troubleshooting

### Erro: "Permission denied"
```bash
gh auth login
# ou
gh auth refresh
```

### Erro: "Repository not found"
Verifique se o repositório existe e você tem acesso:
```bash
gh repo view SEU_USUARIO/SEU_REPO
```

### Erro: "Authentication failed"
1. Gere novo token em: https://github.com/settings/tokens
2. Use o token como senha ao fazer push

### Conflito ao fazer push
```bash
git pull origin main --rebase
git push origin main
```

---

## 📊 Estado Atual do Projeto

Seu projeto inclui:

### Backend (/app/backend/)
- ✅ FastAPI com MongoDB
- ✅ Sistema de autenticação (JWT, Google, Apple)
- ✅ API CNJ DataJud
- ✅ Webhook WhatsApp
- ✅ Sistema de documentos
- ✅ Agendamentos
- ✅ Transcrição de áudios

### Frontend (/app/frontend/)
- ✅ React + Tailwind + ShadCN
- ✅ Dashboard Cliente
- ✅ Dashboard Admin
- ✅ Login/Registro Admin
- ✅ Sistema de agendamento
- ✅ Upload de documentos

### Serviços (/app/backend/services/)
- ✅ auth_service.py
- ✅ cnj_service.py
- ✅ whatsapp_service.py
- ✅ storage_service.py
- ✅ transcription_service.py

---

## 🎉 Próximos Passos

1. **Autentique:**
   ```bash
   gh auth login
   ```

2. **Crie o repositório:**
   ```bash
   cd /app
   gh repo create consultar-processos --private
   ```

3. **Faça o primeiro commit:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sistema completo"
   git push -u origin main
   ```

4. **Continue desenvolvendo:**
   ```bash
   # Sempre que fizer alterações:
   git add .
   git commit -m "Descrição da alteração"
   git push
   ```

---

**Pronto!** Seu código estará versionado e seguro no GitHub! 🚀

Para ajuda adicional:
- GitHub CLI: `gh help`
- Git: `git --help`
- Documentação: https://cli.github.com/manual/
