import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Pagamento = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      localStorage.setItem('userRole', 'client');
      localStorage.setItem('userName', 'Novo Usuário');
      localStorage.setItem('paymentStatus', 'paid');
      toast({ title: 'Pagamento confirmado!', description: 'Sua conta está ativa. Bem-vindo!' });
      setProcessing(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/cadastro')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold text-slate-800">Finalizar Assinatura</CardTitle>
            <CardDescription className="text-center text-slate-600">Complete seu pagamento para ativar sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-6 text-white">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Plano Mensal</p>
                <p className="text-4xl font-bold mb-1">R$ 19,90</p>
                <p className="text-sm opacity-75">por mês</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-slate-700">Consultas ilimitadas de processos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-slate-700">Notificações por WhatsApp e E-mail</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-slate-700">Agendamento com advogado</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-slate-700">Suporte prioritário</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-slate-700">Cancele quando quiser</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 text-center"><strong>Modo Demo:</strong> Gateway de pagamento será integrado em breve. Clique em "Pagar" para simular o pagamento.</p>
            </div>
            <Button onClick={handlePayment} className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-semibold" disabled={processing}>
              {processing ? 'Processando...' : 'Pagar e Ativar Conta'}
            </Button>
            <p className="text-xs text-center text-slate-500">
              Ao confirmar, você concorda com nossos Termos de Uso e Política de Privacidade. Sua assinatura será renovada automaticamente todos os meses.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pagamento;