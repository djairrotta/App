import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Bell, Calendar, LogOut, User, CreditCard, Plus, Eye, Video, Building2, Upload, Download, CheckCircle, Clock } from 'lucide-react';
import { mockProcesses } from '../mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [appointmentData, setAppointmentData] = useState({ 
    date: '', 
    time: '', 
    type: 'online', 
    notes: '' 
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const userName = localStorage.getItem('userName') || 'Cliente';
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleLogout = () => {
    localStorage.clear();
    toast({ title: 'Logout realizado com sucesso!' });
    navigate('/login');
  };

  const buscarHorariosDisponiveis = async (data, tipo = 'ambos') => {
    if (!data) return;
    
    setLoadingHorarios(true);
    try {
      const dataFim = new Date(data);
      dataFim.setDate(dataFim.getDate() + 7); // 7 dias à frente
      
      const response = await fetch(
        `${BACKEND_URL}/api/horarios/disponiveis?data_inicio=${data}&data_fim=${dataFim.toISOString().split('T')[0]}&tipo=${tipo}`
      );
      const result = await response.json();
      
      if (result.success) {
        // Agrupa horários por data
        const horariosPorData = {};
        result.horarios.forEach(h => {
          if (!horariosPorData[h.data]) {
            horariosPorData[h.data] = [];
          }
          horariosPorData[h.data].push(h);
        });
        setHorariosDisponiveis(horariosPorData);
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os horários disponíveis.',
        variant: 'destructive'
      });
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleDateChange = (date) => {
    setAppointmentData({ ...appointmentData, date, time: '' });
    buscarHorariosDisponiveis(date, appointmentData.type);
  };

  const handleTypeChange = (type) => {
    setAppointmentData({ ...appointmentData, type, time: '' });
    if (appointmentData.date) {
      buscarHorariosDisponiveis(appointmentData.date, type);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentData.date || !appointmentData.time || !appointmentData.type) {
      toast({ 
        title: 'Campos obrigatórios', 
        description: 'Por favor, selecione data, horário e tipo de consulta.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Encontra o horário selecionado para pegar hora_fim
      const horarioSelecionado = horariosDisponiveis[appointmentData.date]?.find(
        h => h.hora_inicio === appointmentData.time
      );

      const response = await fetch(`${BACKEND_URL}/api/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '1',
          user_name: userName,
          processo_numero: selectedProcess?.processNumber,
          data: appointmentData.date,
          hora_inicio: appointmentData.time,
          hora_fim: horarioSelecionado?.hora_fim || appointmentData.time,
          tipo: appointmentData.type,
          observacoes: appointmentData.notes,
          origem: 'site'
        })
      });

      const result = await response.json();

      if (result.success) {
        const typeLabel = appointmentData.type === 'online' ? 'Online' : 'Presencial';
        toast({ 
          title: 'Agendamento confirmado!', 
          description: `Consulta ${typeLabel} agendada para ${appointmentData.date} às ${appointmentData.time}. Você receberá uma confirmação por WhatsApp.` 
        });
        setShowAppointmentDialog(false);
        setAppointmentData({ date: '', time: '', type: 'online', notes: '' });
        setHorariosDisponiveis([]);
      } else {
        throw new Error(result.detail || 'Erro ao agendar');
      }
    } catch (error) {
      toast({
        title: 'Erro ao agendar',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Consultar Processos</h1>
                <p className="text-xs text-slate-500">Área do Cliente</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600 hidden sm:block">Olá, {userName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="processos" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="processos">Processos</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="processos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Meus Processos</h2>
                <p className="text-slate-600">Acompanhe todos os seus processos judiciais</p>
              </div>
              <Button className="bg-blue-700 hover:bg-blue-800">
                <Plus className="h-4 w-4 mr-2" />Adicionar Processo
              </Button>
            </div>

            <div className="grid gap-4">
              {mockProcesses.map((process) => (
                <Card key={process.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-blue-800 font-mono">{process.processNumber}</CardTitle>
                        <CardDescription className="mt-2">{process.subject}</CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{process.tribunal}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Tipo</p>
                        <p className="font-medium text-slate-800">{process.type}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <Badge variant="outline" className="mt-1">{process.status}</Badge>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800 flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-cyan-500" />Últimas Movimentações
                        </h4>
                        <span className="text-xs text-slate-500">{process.lastUpdate}</span>
                      </div>
                      <div className="space-y-2">
                        {process.movements.slice(0, 2).map((movement) => (
                          <div key={movement.id} className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-slate-700">{movement.description}</p>
                                <p className="text-xs text-slate-500 mt-1">{movement.date}</p>
                              </div>
                              {movement.hasNotification && (
                                <Badge className="bg-cyan-500 text-white ml-2">Nova</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-4 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedProcess(process)}>
                            <Eye className="h-4 w-4 mr-2" />Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-blue-800 font-mono">{selectedProcess?.processNumber}</DialogTitle>
                            <DialogDescription>{selectedProcess?.subject}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">Tribunal</p>
                                <p className="text-slate-600">{selectedProcess?.tribunal}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">Tipo</p>
                                <p className="text-slate-600">{selectedProcess?.type}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">Parte Ativa</p>
                                <p className="text-slate-600">{selectedProcess?.parts.active}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">Parte Passiva</p>
                                <p className="text-slate-600">{selectedProcess?.parts.passive}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-3">Histórico Completo</h4>
                              <div className="space-y-2">
                                {selectedProcess?.movements.map((movement) => (
                                  <div key={movement.id} className="bg-slate-50 p-3 rounded-lg border">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-semibold text-blue-700">{movement.date}</span>
                                      {movement.hasNotification && (
                                        <Badge className="bg-cyan-500 text-white text-xs">Nova</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-700">{movement.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600" onClick={() => { setSelectedProcess(process); setShowAppointmentDialog(true); }}>
                        <Calendar className="h-4 w-4 mr-2" />Agendar Consulta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agendamentos" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Meus Agendamentos</h2>
              <p className="text-slate-600">Consultas agendadas com seu advogado</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum agendamento no momento</p>
                  <p className="text-sm text-slate-400 mt-2">Agende uma consulta através de qualquer processo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Meu Perfil</h2>
              <p className="text-slate-600">Gerencie suas informações e assinatura</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-700" />Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Nome</p>
                    <p className="font-medium">{userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">CPF</p>
                    <p className="font-medium">123.456.789-00</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">E-mail</p>
                    <p className="font-medium">joao.silva@email.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">WhatsApp</p>
                    <p className="font-medium">(11) 98765-4321</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">Editar Informações</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-green-600" />Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Plano Atual</p>
                    <p className="font-medium">Mensal - R$ 19,90/mês</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Próximo Pagamento</p>
                    <p className="font-medium">15/12/2024</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">Gerenciar Assinatura</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-900">Agendar Consulta com Advogado</DialogTitle>
            <DialogDescription className="text-slate-600">
              Processo: <span className="font-mono font-semibold text-blue-700">{selectedProcess?.processNumber}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-slate-700">
                Tipo de Consulta *
              </Label>
              <Select 
                value={appointmentData.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id="type" className="h-11">
                  <SelectValue placeholder="Selecione o tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span>Online (Videochamada)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="presencial">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-green-600" />
                      <span>Presencial (No Escritório)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-slate-700">
                Data da Consulta *
              </Label>
              <Input 
                id="date" 
                type="date" 
                value={appointmentData.date} 
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-11"
                required
              />
            </div>

            {appointmentData.date && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Horários Disponíveis *
                </Label>
                {loadingHorarios ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Carregando horários...</p>
                  </div>
                ) : horariosDisponiveis[appointmentData.date]?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                    {horariosDisponiveis[appointmentData.date].map((horario) => (
                      <button
                        key={horario.id}
                        type="button"
                        onClick={() => setAppointmentData({ ...appointmentData, time: horario.hora_inicio })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          appointmentData.time === horario.hora_inicio
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-25'
                        }`}
                      >
                        {horario.hora_inicio}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-slate-50">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Nenhum horário disponível nesta data</p>
                    <p className="text-slate-400 text-xs mt-1">Tente outra data</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                Observações (Opcional)
              </Label>
              <Textarea 
                id="notes" 
                placeholder="Descreva brevemente o motivo da consulta ou dúvidas específicas sobre o processo..." 
                value={appointmentData.notes} 
                onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Confirmação por WhatsApp</p>
                  <p className="text-xs text-blue-700">
                    Após o agendamento, você receberá uma mensagem de confirmação no WhatsApp cadastrado com todos os detalhes da consulta.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAppointmentDialog(false)} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleScheduleAppointment} 
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
