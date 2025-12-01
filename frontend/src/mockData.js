// Mock data para desenvolvimento
export const mockProcesses = [
  {
    id: '1',
    processNumber: '1234567-89.2024.8.26.0100',
    tribunal: 'TJSP',
    type: 'Cível',
    subject: 'Ação de Cobrança',
    status: 'Em andamento',
    lastUpdate: '2024-11-28',
    parts: {
      active: 'João Silva',
      passive: 'Empresa XYZ Ltda'
    },
    movements: [
      {
        id: '1',
        date: '2024-11-28',
        description: 'Juntada de petição - Manifestação da parte autora',
        hasNotification: true
      },
      {
        id: '2',
        date: '2024-11-15',
        description: 'Publicação de decisão interlocutória',
        hasNotification: false
      },
      {
        id: '3',
        date: '2024-11-01',
        description: 'Audiência de conciliação realizada',
        hasNotification: false
      }
    ]
  },
  {
    id: '2',
    processNumber: '9876543-21.2024.5.15.0100',
    tribunal: 'TRT15',
    type: 'Trabalhista',
    subject: 'Reclamação Trabalhista',
    status: 'Aguardando sentença',
    lastUpdate: '2024-11-25',
    parts: {
      active: 'Maria Santos',
      passive: 'Indústria ABC S.A.'
    },
    movements: [
      {
        id: '1',
        date: '2024-11-25',
        description: 'Conclusão dos autos ao juiz para sentença',
        hasNotification: true
      },
      {
        id: '2',
        date: '2024-11-10',
        description: 'Audiência de instrução realizada',
        hasNotification: false
      }
    ]
  },
  {
    id: '3',
    processNumber: '5555555-55.2024.4.03.6100',
    tribunal: 'TRF3',
    type: 'Federal',
    subject: 'Mandado de Segurança',
    status: 'Sentenciado',
    lastUpdate: '2024-11-20',
    parts: {
      active: 'Pedro Oliveira',
      passive: 'União Federal'
    },
    movements: [
      {
        id: '1',
        date: '2024-11-20',
        description: 'Publicação de sentença',
        hasNotification: true
      },
      {
        id: '2',
        date: '2024-10-30',
        description: 'Juntada de informações da autoridade coatora',
        hasNotification: false
      }
    ]
  }
];

export const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    status: 'active',
    plan: 'premium',
    paymentStatus: 'paid',
    nextPayment: '2024-12-15',
    registrationDate: '2024-01-15',
    processCount: 5
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria.santos@email.com',
    phone: '(11) 91234-5678',
    status: 'active',
    plan: 'basic',
    paymentStatus: 'paid',
    nextPayment: '2024-12-10',
    registrationDate: '2024-02-20',
    processCount: 3
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    cpf: '456.789.123-00',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 99876-5432',
    status: 'pending',
    plan: 'basic',
    paymentStatus: 'pending',
    nextPayment: '2024-12-05',
    registrationDate: '2024-11-01',
    processCount: 1
  }
];

export const mockAppointments = [
  {
    id: '1',
    clientName: 'João Silva',
    processNumber: '1234567-89.2024.8.26.0100',
    date: '2024-12-05',
    time: '14:00',
    status: 'scheduled',
    type: 'online',
    notes: 'Discutir petição de recurso'
  },
  {
    id: '2',
    clientName: 'Maria Santos',
    processNumber: '9876543-21.2024.5.15.0100',
    date: '2024-12-03',
    time: '10:00',
    status: 'completed',
    type: 'presencial',
    notes: 'Análise de documentos'
  }
];

export const mockStats = {
  totalClients: 156,
  activeProcesses: 342,
  pendingPayments: 12,
  scheduledAppointments: 8,
  downloadsRealizados: 1250,
  documentosMonitorados: 3420,
  acessosPorDia: 890
};

export const mockTestimonials = [
  {
    id: '1',
    name: 'PATRICIA ALESSANDRA',
    rating: 5,
    text: 'Recebo informações dos processos no momento da movimentação, até antes do advogado entrar em contato.',
    platform: 'android'
  },
  {
    id: '2',
    name: 'IRMÃOS A OBRA',
    rating: 4,
    text: 'Único que eu consegui consultar de fato, o processo estava lá.',
    platform: 'android'
  },
  {
    id: '3',
    name: 'CARLOS ROBERTO',
    rating: 5,
    text: 'Excelente aplicativo! Me ajuda muito a acompanhar meus processos sem precisar ficar entrando nos sites dos tribunais.',
    platform: 'ios'
  }
];

export const mockUser = {
  id: '1',
  name: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao.silva@email.com',
  phone: '(11) 98765-4321',
  role: 'client',
  plan: 'premium',
  paymentStatus: 'paid',
  nextPayment: '2024-12-15',
  registrationDate: '2024-01-15'
};

export const mockAdmin = {
  id: 'admin1',
  name: 'Admin do Sistema',
  email: 'admin@consultarprocessos.com.br',
  role: 'admin'
};
