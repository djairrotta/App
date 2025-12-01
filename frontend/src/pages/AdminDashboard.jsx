import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, LogOut, Users, AlertCircle, Settings, Calendar, Eye, Plus, Clock, Trash2, Video, Phone } from 'lucide-react';
import { mockClients, mockStats, mockAppointments, mockProcesses } from '../mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateHorariosDialog, setShowCreateHorariosDialog] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [formData, setFormData] = useState({
    data_inicio: '',
    data_fim: '',
    hora_inicio: '09:00',
    hora_fim: '18:00',
    duracao_minutos: 60,
    dias_semana: [1, 2, 3, 4, 5],
    tipo_permitido: 'ambos'
  });
  const adminName = localStorage.getItem('userName') || 'Admin';
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const buscarHorarios = async () => {
    setLoadingHorarios(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/horarios`);
      const result = await response.json();
      if (result.success) {
        setHorarios(result.horarios);
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    } finally {
      setLoadingHorarios(false);
    }
  };

  useEffect(() => {
    buscarHorarios();
  }, []);

  const handleCreateHorarios = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/horarios/lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Horários criados!',
          description: `${result.total} horários foram criados com sucesso.`
        });
        setShowCreateHorariosDialog(false);
        buscarHorarios();
        setFormData({
          data_inicio: '',
          data_fim: '',
          hora_inicio: '09:00',
          hora_fim: '18:00',
          duracao_minutos: 60,
          dias_semana: [1, 2, 3, 4, 5],
          tipo_permitido: 'ambos'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar os horários.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteHorario = async (horarioId) => {
    if (!confirm('Deseja realmente excluir este horário?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/horarios/${horarioId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({ title: 'Horário excluído com sucesso!' });
        buscarHorarios();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o horário.',
        variant: 'destructive'
      });
    }
  };

  const handleChamarReuniao = (cliente) => {
    // Aqui você pode adicionar lógica para:
    // 1. Abrir link do Google Meet/Zoom
    // 2. Enviar convite por WhatsApp
    // 3. Iniciar chamada direta
    toast({
      title: 'Chamando para reunião',
      description: `Iniciando chamada com ${cliente.name} (${cliente.phone})...`,
    });
    
    // Exemplo: abrir WhatsApp (simulação)
    // const whatsappNumber = cliente.phone.replace(/\D/g, '');
    // window.open(`https://wa.me/55${whatsappNumber}?text=Olá! Gostaria de agendar uma reunião online.`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-700 to-blue-800 border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Painel Administrativo</h1>
                <p className="text-xs text-blue-100">Consultar Processos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white hidden sm:block">Olá, {adminName}</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{mockStats.totalClients}</div>
              <p className="text-xs text-slate-500 mt-1">Cadastrados na plataforma</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <FileText className="h-4 w-4 mr-2" />Processos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{mockStats.activeProcesses}</div>
              <p className="text-xs text-slate-500 mt-1">Em monitoramento</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />Pagamentos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{mockStats.pendingPayments}</div>
              <p className="text-xs text-slate-500 mt-1">Aguardando pagamento</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{mockStats.scheduledAppointments}</div>
              <p className="text-xs text-slate-500 mt-1">Consultas agendadas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clientes" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="processos">Processos</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="configuracoes">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Clientes</CardTitle>
                <CardDescription>Visualize e gerencie todos os clientes cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="font-mono text-sm">{client.cpf}</TableCell>
                        <TableCell>
                          <Badge variant={client.plan === 'premium' ? 'default' : 'secondary'}>
                            {client.plan === 'premium' ? 'Premium' : 'Básico'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={client.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {client.paymentStatus === 'paid' ? 'Ativo' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.processCount}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalhes do Cliente</DialogTitle>
                                <DialogDescription>{selectedClient?.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div><p className="text-sm font-semibold text-slate-700">CPF</p><p className="text-slate-600">{selectedClient?.cpf}</p></div>
                                  <div><p className="text-sm font-semibold text-slate-700">E-mail</p><p className="text-slate-600">{selectedClient?.email}</p></div>
                                  <div><p className="text-sm font-semibold text-slate-700">Telefone</p><p className="text-slate-600">{selectedClient?.phone}</p></div>
                                  <div><p className="text-sm font-semibold text-slate-700">Plano</p><Badge>{selectedClient?.plan}</Badge></div>
                                  <div><p className="text-sm font-semibold text-slate-700">Data de Cadastro</p><p className="text-slate-600">{selectedClient?.registrationDate}</p></div>
                                  <div><p className="text-sm font-semibold text-slate-700">Próximo Pagamento</p><p className="text-slate-600">{selectedClient?.nextPayment}</p></div>
                                </div>
                                <div className="pt-4 border-t">
                                  <p className="text-sm font-semibold text-slate-700 mb-2">Ações</p>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Enviar Mensagem</Button>
                                    <Button variant="outline" size="sm">Bloquear Acesso</Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Processos</CardTitle>
                <CardDescription>Visualize todos os processos monitorados na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número do Processo</TableHead>
                      <TableHead>Tribunal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProcesses.map((process) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-mono text-sm">{process.processNumber}</TableCell>
                        <TableCell><Badge variant="outline">{process.tribunal}</Badge></TableCell>
                        <TableCell>{process.type}</TableCell>
                        <TableCell><Badge className="bg-blue-100 text-blue-800">{process.status}</Badge></TableCell>
                        <TableCell>{process.lastUpdate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horarios" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Horários Disponíveis</CardTitle>
                    <CardDescription>Configure os horários que os clientes poderão agendar (30 minutos ou 1 hora)</CardDescription>
                  </div>
                  <Dialog open={showCreateHorariosDialog} onOpenChange={setShowCreateHorariosDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-cyan-500 hover:bg-cyan-600">
                        <Plus className="h-4 w-4 mr-2" />Criar Horários em Lote
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Criar Horários em Lote</DialogTitle>
                        <DialogDescription>Configure um intervalo de datas e horários</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data Início *</Label>
                            <Input 
                              type="date" 
                              value={formData.data_inicio}
                              onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data Fim *</Label>
                            <Input 
                              type="date" 
                              value={formData.data_fim}
                              onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                              min={formData.data_inicio}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Hora Início</Label>
                            <Input 
                              type="time" 
                              value={formData.hora_inicio}
                              onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hora Fim</Label>
                            <Input 
                              type="time" 
                              value={formData.hora_fim}
                              onChange={(e) => setFormData({...formData, hora_fim: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Duração do Agendamento</Label>
                          <Select 
                            value={formData.duracao_minutos.toString()}
                            onValueChange={(value) => setFormData({...formData, duracao_minutos: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="60">1 hora</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Dias da Semana</Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { value: 1, label: 'Seg' },
                              { value: 2, label: 'Ter' },
                              { value: 3, label: 'Qua' },
                              { value: 4, label: 'Qui' },
                              { value: 5, label: 'Sex' },
                              { value: 6, label: 'Sáb' },
                              { value: 7, label: 'Dom' }
                            ].map(dia => (
                              <Button
                                key={dia.value}
                                type="button"
                                variant={formData.dias_semana.includes(dia.value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const novos = formData.dias_semana.includes(dia.value)
                                    ? formData.dias_semana.filter(d => d !== dia.value)
                                    : [...formData.dias_semana, dia.value];
                                  setFormData({...formData, dias_semana: novos});
                                }}
                              >
                                {dia.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo Permitido</Label>
                          <Select 
                            value={formData.tipo_permitido}
                            onValueChange={(value) => setFormData({...formData, tipo_permitido: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ambos">Ambos (Online e Presencial)</SelectItem>
                              <SelectItem value="online">Apenas Online</SelectItem>
                              <SelectItem value="presencial">Apenas Presencial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <Clock className="h-4 w-4 inline mr-1" />
                            <strong>Duração:</strong> {formData.duracao_minutos === 30 ? '30 minutos' : '1 hora'} por agendamento
                          </p>
                        </div>
                        <Button onClick={handleCreateHorarios} className="w-full bg-cyan-500 hover:bg-cyan-600">
                          Criar Horários
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingHorarios ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Carregando horários...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-600">
                        Total de horários: <strong>{horarios.length}</strong> | 
                        Disponíveis: <strong>{horarios.filter(h => h.disponivel).length}</strong> | 
                        Ocupados: <strong>{horarios.filter(h => !h.disponivel).length}</strong>
                      </p>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Duração</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {horarios.map((horario) => (
                            <TableRow key={horario.id}>
                              <TableCell className="font-medium">
                                {new Date(horario.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="font-mono">
                                {horario.hora_inicio} - {horario.hora_fim}
                              </TableCell>
                              <TableCell>{horario.duracao_minutos}min</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {horario.tipo_permitido === 'ambos' ? 'Ambos' : 
                                   horario.tipo_permitido === 'online' ? 'Online' : 'Presencial'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {horario.disponivel ? (
                                  <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">Ocupado</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteHorario(horario.id)}
                                  disabled={!horario.disponivel}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agendamentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos de Consultas</CardTitle>
                <CardDescription>Gerencie as consultas agendadas pelos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Processo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.clientName}</TableCell>
                        <TableCell className="font-mono text-sm">{appointment.processNumber}</TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell><Badge variant="outline">{appointment.type}</Badge></TableCell>
                        <TableCell>
                          <Badge className={appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                            {appointment.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-700" />Configurações de Scraping
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Tribunais Monitorados</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm">TRF3 - Tribunal Regional Federal 3ª Região</span>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm">TJSP - Tribunal de Justiça de São Paulo</span>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm">TRT15 - Tribunal Regional do Trabalho 15ª Região</span>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm">TJM - Tribunal de Justiça Militar</span>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Configurar Scrapers</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Integração WhatsApp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Status da API Z-API</p>
                    <Badge className="bg-yellow-100 text-yellow-800">Aguardando Configuração</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">Configure suas credenciais Z-API para ativar notificações por WhatsApp</p>
                  </div>
                  <Button variant="outline" className="w-full">Configurar Z-API</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Gateway de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Status</p>
                    <Badge className="bg-yellow-100 text-yellow-800">Aguardando Integração</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">Configure a fintech de pagamento para processar as assinaturas</p>
                  </div>
                  <Button variant="outline" className="w-full">Configurar Gateway</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
