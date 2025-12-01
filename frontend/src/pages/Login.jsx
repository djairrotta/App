import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { FileText, ArrowLeft } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      if (cleanCPF === '12345678900') {
        localStorage.setItem('userRole', 'client');
        localStorage.setItem('userName', 'João Silva');
        localStorage.setItem('userCPF', cpf);
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo de volta!'
        });
        navigate('/dashboard');
      } else if (cleanCPF === '00000000000') {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Admin do Sistema');
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo, Admin!'
        });
        navigate('/admin');
      } else {
        toast({
          title: 'CPF não encontrado',
          description: 'Verifique o CPF ou faça seu cadastro.',
          variant: 'destructive'
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold text-slate-800">
              Consultar Processos
            </CardTitle>
            <CardDescription className="text-center text-slate-600">
              Entre com seu CPF para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" type="text" placeholder="000.000.000-00" value={cpf} onChange={handleCPFChange} maxLength={14} required className="h-12 text-lg" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Para testar:</strong><br />Cliente: 123.456.789-00<br />Admin: 000.000.000-00
                </p>
              </div>
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white text-lg font-semibold" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Ainda não tem conta?{' '}
                  <button type="button" onClick={() => navigate('/cadastro')} className="text-blue-700 font-semibold hover:text-blue-800 transition-colors">
                    Cadastre-se
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

export default Login;