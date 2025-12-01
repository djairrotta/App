# Contratos da Aplicação - Consultar Processos

## Visão Geral
Sistema completo de consulta de processos judiciais brasileiros com dashboard do cliente e admin, scraping de tribunais, notificações WhatsApp e sistema de pagamento.

## Status Atual
✅ **Frontend completo com mock data** - Todas as páginas e funcionalidades visuais implementadas
⏳ **Backend** - Será implementado após aprovação do frontend

---

## 📱 Páginas Implementadas (Frontend)

### 1. Landing Page (/)
- Hero section com mockup de celular
- Contadores animados (downloads, documentos, acessos)
- Seção de testemunhos
- Badges App Store e Google Play
- CTA para cadastro

### 2. Login (/login)
- Input formatado de CPF
- Validação mock
- **Credenciais de teste:**
  - Cliente: 123.456.789-00
  - Admin: 000.000.000-00

### 3. Cadastro (/cadastro)
- Formulário com nome, CPF, email, WhatsApp
- Formatação automática de CPF e telefone
- Redirecionamento para pagamento

### 4. Pagamento (/pagamento)
- Tela de checkout com valor R$ 19,90/mês
- Lista de benefícios do plano
- Simulação de pagamento (mock)

### 5. Dashboard Cliente (/dashboard)
- **Tab Processos:**
  - Lista de processos com número, tribunal, tipo, status
  - Últimas movimentações com badge "Nova"
  - Visualização de detalhes completos
  - Botão para agendar consulta com advogado
  - Botão para adicionar novo processo
  
- **Tab Agendamentos:**
  - Lista de consultas agendadas
  - Vazia no mock
  
- **Tab Perfil:**
  - Informações pessoais (nome, CPF, email, WhatsApp)
  - Informações de assinatura (plano, status, próximo pagamento)
  - Botões para editar

### 6. Dashboard Admin (/admin)
- **Cards de estatísticas:**
  - Total de clientes
  - Processos ativos
  - Pagamentos pendentes
  - Agendamentos
  
- **Tab Clientes:**
  - Tabela completa de clientes
  - Status de pagamento
  - Quantidade de processos
  - Visualização de detalhes
  
- **Tab Processos:**
  - Todos os processos da plataforma
  - Filtros por tribunal, tipo, status
  
- **Tab Agendamentos:**
  - Todas as consultas agendadas
  - Status (agendado/concluído)
  
- **Tab Configurações:**
  - Status dos scrapers (TRF3, TJSP, TRT15, TJM)
  - Estatísticas da plataforma
  - Configuração Z-API (WhatsApp)
  - Configuração Gateway de Pagamento

---

## 🔌 APIs a Implementar (Backend)

### Autenticação
```
POST /api/auth/register
Body: { name, cpf, email, phone }
Response: { userId, message }

POST /api/auth/login
Body: { cpf }
Response: { token, user: { id, name, role, paymentStatus } }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user details }
```

### Processos
```
GET /api/processes
Headers: Authorization: Bearer {token}
Response: [ { id, processNumber, tribunal, type, subject, status, lastUpdate, parts, movements } ]

POST /api/processes
Body: { processNumber, tribunal }
Response: { process details }

GET /api/processes/:id
Response: { complete process details with all movements }

GET /api/processes/:id/movements
Response: [ { id, date, description, hasNotification } ]
```

### Agendamentos
```
GET /api/appointments
Response: [ { id, clientName, processNumber, date, time, status, type, notes } ]

POST /api/appointments
Body: { processId, date, time, notes }
Response: { appointment details }

PATCH /api/appointments/:id
Body: { status }
Response: { updated appointment }
```

### Admin
```
GET /api/admin/clients
Response: [ { client details with stats } ]

GET /api/admin/stats
Response: { totalClients, activeProcesses, pendingPayments, scheduledAppointments }

GET /api/admin/processes
Response: [ all processes ]

PATCH /api/admin/clients/:id/status
Body: { status: 'active' | 'blocked' }
Response: { updated client }
```

### Pagamento
```
POST /api/payment/create-subscription
Body: { userId, plan: 'monthly' }
Response: { paymentUrl, subscriptionId }

POST /api/payment/webhook
Body: { fintech webhook data }
Response: { received: true }

GET /api/payment/status/:userId
Response: { paymentStatus, nextPayment, plan }
```

### Scraping (Cron Jobs)
```
POST /api/scraping/run
Body: { tribunal: 'TJSP' | 'TRF3' | 'TRT15' | 'TJM' }
Response: { status: 'running', jobId }

GET /api/scraping/status/:jobId
Response: { status, processedCount, errors }
```

### Notificações (WhatsApp via Z-API)
```
POST /api/notifications/send
Body: { userId, message, phone }
Response: { sent: true, messageId }

POST /api/notifications/process-update
Body: { processId, movementId }
Response: { notificationsSent: number }
```

---

## 🗄️ Modelos do Banco de Dados (MongoDB)

### User
```javascript
{
  _id: ObjectId,
  name: String,
  cpf: String (unique, indexed),
  email: String,
  phone: String,
  role: String ('client' | 'admin'),
  plan: String ('basic' | 'premium'),
  paymentStatus: String ('paid' | 'pending' | 'cancelled'),
  nextPayment: Date,
  registrationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Process
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  processNumber: String (indexed),
  tribunal: String,
  type: String,
  subject: String,
  status: String,
  lastUpdate: Date,
  parts: {
    active: String,
    passive: String
  },
  scrapingStatus: String ('active' | 'error' | 'not_found'),
  lastScrapedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ProcessMovement
```javascript
{
  _id: ObjectId,
  processId: ObjectId (ref: Process),
  date: Date,
  description: String,
  hasNotification: Boolean,
  notificationSent: Boolean,
  createdAt: Date
}
```

### Appointment
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  processId: ObjectId (ref: Process),
  date: Date,
  time: String,
  status: String ('scheduled' | 'completed' | 'cancelled'),
  type: String ('online' | 'presencial'),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number,
  status: String ('pending' | 'paid' | 'failed' | 'cancelled'),
  subscriptionId: String,
  paymentDate: Date,
  nextPaymentDate: Date,
  gatewayResponse: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### ScrapingLog
```javascript
{
  _id: ObjectId,
  tribunal: String,
  processNumber: String,
  status: String ('success' | 'error' | 'not_found'),
  movementsFound: Number,
  errorMessage: String,
  executedAt: Date,
  executionTime: Number (ms)
}
```

---

## 🔧 Integrações Necessárias

### 1. Scrapers de Tribunais
- **TRF3** - Tribunal Regional Federal 3ª Região
- **TJSP** - Tribunal de Justiça de São Paulo
- **TRT15** - Tribunal Regional do Trabalho 15ª Região
- **TJM** - Tribunal de Justiça Militar

Cada scraper deve:
- Buscar processos por número
- Extrair movimentações
- Atualizar banco de dados
- Enviar notificações se houver novas movimentações
- Registrar logs de execução

### 2. Z-API (WhatsApp Business)
- Enviar notificações de novas movimentações
- Confirmar agendamentos
- Alertas de pagamento
- **Credenciais:** A serem fornecidas pelo cliente

### 3. Gateway de Pagamento (Fintech)
- Processar assinatura mensal de R$ 19,90
- Webhook para atualizar status de pagamento
- Gerenciar renovação automática
- **Credenciais:** A serem fornecidas pelo cliente

---

## 📊 Dados Mockados (mock.js)

Atualmente mockados:
- `mockProcesses` - 3 processos com movimentações
- `mockClients` - 3 clientes com diferentes status
- `mockAppointments` - 2 agendamentos
- `mockStats` - Estatísticas da plataforma
- `mockTestimonials` - 3 depoimentos
- `mockUser` - Usuário cliente
- `mockAdmin` - Usuário admin

**Ação no Backend:** Substituir todas as chamadas ao mockData.js por chamadas reais à API.

---

## 🎨 Design System

### Cores (do site original)
- **Primary:** `#1e40af` (azul royal/escuro)
- **Secondary:** `#06b6d4` (azul claro/cyan)
- **Accent:** `#f97316` (laranja para estrelas)
- **Background:** `#f8fafc` (cinza claro)
- **Success:** `#10b981` (verde)
- **Warning:** `#f59e0b` (amarelo)
- **Danger:** `#ef4444` (vermelho)

### Componentes ShadCN Utilizados
- Button, Card, Badge, Tabs
- Dialog, Input, Label, Textarea
- Table, Toast, Select
- Todos os componentes estão em `/app/frontend/src/components/ui/`

---

## 🚀 Próximos Passos

### Fase 1: Setup Backend
1. Configurar modelos do MongoDB
2. Implementar autenticação JWT
3. Criar endpoints básicos de CRUD

### Fase 2: Scrapers
1. Implementar scraper para TJSP (mais comum)
2. Implementar scraper para TRF3
3. Implementar scraper para TRT15
4. Implementar scraper para TJM
5. Configurar cron jobs para execução periódica

### Fase 3: Integrações
1. Integrar Z-API para WhatsApp
2. Integrar gateway de pagamento da fintech
3. Implementar sistema de notificações

### Fase 4: Testes e Deploy
1. Testes de integração
2. Testes de carga nos scrapers
3. Deploy e monitoramento

---

## 📝 Notas Importantes

- **Scraping:** Os tribunais brasileiros não possuem APIs oficiais, então o scraping é a única opção. Implementar com cuidado para evitar bloqueios.
- **Pagamento:** O gateway da fintech será fornecido depois. Por enquanto, mock implementado.
- **WhatsApp:** Z-API credenciais serão fornecidas pelo cliente.
- **Segurança:** Implementar rate limiting, validação de CPF, criptografia de dados sensíveis.
- **Performance:** Usar cache para processos já consultados, otimizar queries do MongoDB.
