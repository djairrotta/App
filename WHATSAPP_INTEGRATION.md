# 📱 Integração WhatsApp - Guia Completo

## 🎯 Funcionalidades Implementadas

### 1. **Webhook do WhatsApp**
- Recebe mensagens automáticas dos clientes
- Processa diferentes tipos de mídia
- Organiza arquivos por cliente

### 2. **Tipos de Mensagens Suportadas**

#### 📝 Mensagens de Texto
- Salvas no backup de conversas
- Gera notificação para o admin

#### 🎤 Mensagens de Áudio
- Download automático do áudio
- **Transcrição automática** usando OpenAI Whisper
- Salva áudio + transcrição em pastas separadas
- Útil para: depoimentos, instruções verbais, etc

#### 📷 Imagens/Fotos
- Download automático
- Cria solicitação de documento automaticamente
- Status: "enviado"
- Cliente pode enviar RG, comprovantes, fotos de documentos

#### 📄 Documentos (PDF, DOC, etc)
- Download automático
- Cria solicitação de documento automaticamente
- Qualquer tipo de arquivo

### 3. **Organização de Arquivos por Cliente**

Cada cliente tem sua pasta estruturada:

```
storage/
└── {client_id}_{nome_cliente}/
    ├── documentos/              # Docs enviados pelo site
    ├── whatsapp/
    │   ├── audios/             # Áudios recebidos
    │   ├── transcricoes/       # Textos transcritos dos áudios
    │   ├── imagens/            # Fotos recebidas
    │   └── documentos/         # Docs recebidos pelo WhatsApp
    ├── reunioes/               # Formulários e atas de reuniões
    ├── atendimentos/           # Registros de atendimentos
    └── backup_conversas/       # conversas.json com todo histórico
```

---

## ⚙️ Configuração do Z-API

### Passo 1: Obter Credenciais Z-API

1. Acesse: https://z-api.io
2. Crie uma conta ou faça login
3. Crie uma instância do WhatsApp Business
4. Anote as credenciais:
   - **Instance ID**: ex: `3D0A1B2C3D`
   - **Token**: ex: `ABC123XYZ789`
   - **URL Base**: ex: `https://api.z-api.io/instances/SUA_INSTANCIA`

### Passo 2: Configurar Variáveis de Ambiente

Edite `/app/backend/.env`:

```env
# Z-API WhatsApp Business Configuration
ZAPI_URL="https://api.z-api.io/instances/SUA_INSTANCIA"
ZAPI_INSTANCE_ID="3D0A1B2C3D"
ZAPI_TOKEN="ABC123XYZ789"
```

### Passo 3: Configurar Webhook no Z-API

1. No painel Z-API, vá em **Webhooks**
2. Configure o webhook para:
   - **URL**: `https://SEU_DOMINIO/api/webhook/whatsapp`
   - **Eventos**: Marque todos (messages, status, etc)
3. Salve

### Passo 4: Reiniciar Backend

```bash
sudo supervisorctl restart backend
```

---

## 🔊 Configuração da Transcrição de Áudio

### Opção 1: Usar Emergent LLM Key (Recomendado)

Se você tem acesso à chave universal Emergent:

```env
EMERGENT_LLM_KEY="sua_chave_emergent_aqui"
```

### Opção 2: Usar OpenAI Diretamente

Se preferir usar sua própria chave OpenAI:

```env
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxx"
```

**Custos de Transcrição (OpenAI Whisper):**
- $0.006 por minuto de áudio
- Extremamente barato para uso normal
- Exemplo: 100 minutos = $0.60

---

## 🧪 Testar a Integração

### Teste 1: Enviar Mensagem de Texto

1. Cliente envia mensagem no WhatsApp
2. Verifique no admin: `/api/admin/notifications`
3. Mensagem aparece no backup: `storage/{client_id}_{nome}/backup_conversas/conversas.json`

### Teste 2: Enviar Áudio

1. Cliente envia áudio no WhatsApp
2. Sistema baixa o áudio
3. Transcreve automaticamente
4. Salva em:
   - `whatsapp/audios/` → áudio original
   - `whatsapp/transcricoes/` → texto transcrito

### Teste 3: Enviar Foto/Documento

1. Cliente envia foto de RG pelo WhatsApp
2. Sistema baixa e salva em `whatsapp/imagens/`
3. Cria automaticamente uma solicitação de documento
4. Admin vê no dashboard: tab "Documentos"

---

## 📊 APIs Criadas

### Webhook (Recebe Mensagens)
```
POST /api/webhook/whatsapp
Body: { payload do Z-API }
```

### Listar Notificações (Admin)
```
GET /api/admin/notifications
Response: Lista últimas 50 notificações
```

### Listar Arquivos do Cliente (Admin)
```
GET /api/admin/client/{client_id}/files
Response: {
  "documentos": [...],
  "whatsapp_audios": [...],
  "whatsapp_transcricoes": [...],
  "whatsapp_imagens": [...],
  "whatsapp_documentos": [...],
  "reunioes": [...],
  "atendimentos": [...]
}
```

---

## 🔔 Fluxo Completo de Documento via WhatsApp

### Cenário: Cliente Envia RG pelo WhatsApp

1. **Cliente** tira foto do RG e envia no WhatsApp
2. **Sistema** recebe via webhook:
   - Baixa a imagem
   - Salva em `storage/1_joao_silva/whatsapp/imagens/`
   - Cria solicitação de documento automaticamente
   - Status: "enviado"
3. **Admin** vê no dashboard:
   - Tab "Documentos" → nova solicitação
   - Pode visualizar/baixar a imagem
   - Pode aprovar/rejeitar

### Cenário: Cliente Envia Áudio com Depoimento

1. **Cliente** grava áudio explicando algo no WhatsApp
2. **Sistema**:
   - Baixa o áudio
   - Transcreve com OpenAI Whisper
   - Salva áudio + transcrição
3. **Admin** pode:
   - Ouvir o áudio
   - Ler a transcrição
   - Usar como evidência/registro

---

## 🛡️ Segurança

- ✅ Arquivos organizados por cliente (isolamento)
- ✅ Backup automático de conversas
- ✅ Logs de todas as operações
- ✅ Apenas clientes cadastrados podem enviar
- ✅ Webhook valida origem (Z-API)

---

## 📝 Modo Simulação

Se você ainda não configurou o Z-API, o sistema funciona em **modo simulação**:

- Mensagens são logadas no console
- Estrutura de pastas é criada
- Tudo funciona, exceto envio real pelo WhatsApp

Para testar:
```bash
curl -X POST http://localhost:8001/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511987654321@c.us",
    "type": "chat",
    "body": "Teste de mensagem",
    "fromMe": false
  }'
```

---

## 🎓 Exemplo de Uso Real

**Escritório de Advocacia:**

1. Cliente pergunta sobre processo pelo WhatsApp
2. Advogado responde e pede documentos
3. Cliente tira foto do RG e envia no WhatsApp
4. Sistema processa automaticamente:
   - Salva foto
   - Cria solicitação
   - Notifica admin
5. Admin aprova documento
6. Tudo fica registrado na pasta do cliente

**Benefícios:**
- ✅ Cliente não precisa usar o site para enviar docs urgentes
- ✅ Tudo organizado automaticamente
- ✅ Histórico completo de conversas
- ✅ Transcrições de áudios para referência futura

---

## 🚀 Próximos Passos (Sugestões)

1. **IA para Análise de Documentos**: OCR para extrair dados de RG, CNH, etc
2. **Chatbot Automático**: Respostas automáticas para perguntas comuns
3. **Análise de Sentimento**: Detectar clientes insatisfeitos
4. **Resumo Automático**: IA gera resumo das conversas
5. **Integração com CRM**: Sincronizar com outros sistemas

---

**Sistema completo implementado e pronto para uso! 🎉**
