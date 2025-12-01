import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', cpf: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf') { formattedValue = formatCPF(value); }
    else if (name === 'phone') { formattedValue = formatPhone(value); }
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: 'Cadastro realizado com sucesso!', description: 'Agora você será redirecionado para o pagamento.' });
      setLoading(false);
      navigate('/pagamento');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold text-slate-800">Criar Conta</CardTitle>
            <CardDescription className="text-center text-slate-600">Preencha seus dados para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" type="text" placeholder="Seu nome completo" value={formData.name} onChange={handleChange} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" name="cpf" type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} maxLength={14} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" name="phone" type="text" placeholder="(00) 00000-0000" value={formData.phone} onChange={handleChange} maxLength={15} required className="h-11" />
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-cyan-900 mb-1">Plano Mensal: R$ 19,90</p>
                    <ul className="text-xs text-cyan-800 space-y-1">
                      <li>• Consulta ilimitada de processos</li>
                      <li>• Notificações por WhatsApp e E-mail</li>
                      <li>• Agendamento com advogado</li>
                      <li>• Suporte prioritário</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-lg font-semibold" disabled={loading}>
                {loading ? 'Processando...' : 'Continuar para Pagamento'}
              </Button>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Já tem uma conta?{' '}
                  <button type="button" onClick={() => navigate('/login')} className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors">
                    Fazer login
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;