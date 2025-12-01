import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, LogOut, Users, AlertCircle, Settings, Calendar, Eye, Plus, Clock, Trash2 } from 'lucide-react';
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="processos">Processos</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
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
