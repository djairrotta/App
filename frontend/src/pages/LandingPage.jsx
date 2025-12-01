import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Star, Smartphone, FileText } from 'lucide-react';
import { mockStats, mockTestimonials } from '../mockData';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ downloads: 0, documents: 0, accesses: 0 });

  // Animação de contadores
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        downloads: Math.floor(mockStats.downloadsRealizados * progress),
        documents: Math.floor(mockStats.documentosMonitorados * progress),
        accesses: Math.floor(mockStats.acessosPorDia * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-700" />
              <span className="text-xl font-bold text-blue-900">Consultar Processos</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={() => navigate('/cadastro')}>
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Phone mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-[600px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] shadow-2xl p-4">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">Meus Processos</span>
                      </div>
                      <input
                        type="text"
                        placeholder="012.345.678-90"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/60"
                        readOnly
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-blue-700">PARTE DO PROCESSO</span>
                            <Smartphone className="h-4 w-4 text-cyan-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 mb-1">Fulano Ciclano</p>
                          <p className="text-xs text-slate-500 mb-2">Inventário Inventário e Partilha</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">04/04/2025</span>
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">NOVA</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
                CONSULTAR
                <br />
                <span className="text-blue-700">PROCESSOS</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Veja os processos, tenha explicações e acompanhe com notificações no seu email e WhatsApp
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-14 cursor-pointer hover:scale-105 transition-transform"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  className="h-14 cursor-pointer hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-500 mb-3">+{stats.downloads}</div>
              <p className="text-lg text-blue-700 font-medium">Donwloads Realizados</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-500 mb-3">+{stats.documents}</div>
              <p className="text-lg text-blue-700 font-medium">Documentos Monitorados</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-500 mb-3">+{stats.accesses}</div>
              <p className="text-lg text-blue-700 font-medium">Acessos por dia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">O que nossos usuários dizem</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 uppercase">{testimonial.name}</h3>
                      <div className="flex mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < testimonial.rating ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {testimonial.platform === 'android' ? (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{testimonial.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Store Ratings */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl font-bold text-slate-800">Nota 4,5</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-14 mx-auto cursor-pointer hover:scale-105 transition-transform"
              />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl font-bold text-slate-800">Nota 4,3</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on the App Store"
                className="h-14 mx-auto cursor-pointer hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Baixe o APP</h2>
          <p className="text-xl text-blue-100 mb-8">
            Comece a acompanhar seus processos judiciais de forma simples e prática
          </p>
          <Button
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-6 text-lg"
            onClick={() => navigate('/cadastro')}
          >
            Começar Agora - R$ 19,90/mês
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2024 Consultar Processos. Todos os direitos reservados.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
