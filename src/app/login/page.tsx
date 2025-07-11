"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Image from "next/image";
import { toast } from "@/shared/hooks/use-toast";
import { Building2, TrendingUp, Users, BarChart3, Star, CheckCircle, UserPlus, Target } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const testimonials = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Gerente de RH",
    company: "TechCorp",
    content: "A plataforma revolucionou nosso processo de recrutamento. Conseguimos reduzir o tempo de contratação em 60%.",
    avatar: "/avatars/ana.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "Diretor de Pessoas",
    company: "InnovateLab",
    content: "A IA da plataforma é impressionante. Ela consegue identificar talentos que tradicionalmente passariam despercebidos.",
    avatar: "/avatars/carlos.jpg",
    rating: 5
  },
  {
    id: 3,
    name: "Marina Costa",
    role: "Head de Talentos",
    company: "StartupXYZ",
    content: "Interface intuitiva e resultados excepcionais. Nossa equipe adotou rapidamente e os resultados apareceram na primeira semana.",
    avatar: "/avatars/marina.jpg",
    rating: 5
  }
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    if (error) {
      let errorMessage = "Ocorreu um erro ao fazer login.";
      if (error === "AccessDenied") {
        errorMessage = "Seu e-mail não está autorizado. Por favor, entre em contato com o administrador.";
      } else if (error === "OAuthAccountNotLinked") {
        errorMessage = "Este e-mail já está registrado com outro método de login. Por favor, use o método original.";
      }
      toast({
        title: "Erro de Login",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" }); // Redireciona para o dashboard após login
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 h-auto md:h-screen md:max-h-[900px]">
          <Card className="col-span-1 sm:col-span-2 md:col-span-1 md:row-span-2 overflow-hidden">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-center">
              <div className="text-center">
                <Building2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Sistema de Recrutamento IA</h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Plataforma inteligente que otimiza e automatiza o processo de seleção de candidatos,
                  utilizando IA para análise de currículos e ranqueamento.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-1 md:col-span-1 md:row-span-1">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-90" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">4.875</div>
                <div className="text-xs sm:text-sm opacity-90">Vagas Preenchidas</div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-1 md:col-span-1 md:row-span-1">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-90" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">57K</div>
                <div className="text-xs sm:text-sm opacity-90">Novos Usuários</div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-2 md:col-span-1 md:col-start-4 md:row-start-1 md:row-span-2">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-center">
              <div className="text-center">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-3">Funcionalidades</h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2 text-left">
                  <li>• Gerenciamento de Vagas</li>
                  <li>• Processo por Etapas</li>
                  <li>• Dashboard Completo</li>
                  <li>• Painel Administrativo</li>
                  <li>• Relatórios Exportáveis</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-2 md:col-start-2 md:row-start-2 md:col-span-2 md:row-span-2">
            <CardHeader className="text-center pb-4">
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={112}
                height={112}
                className="h-16 sm:h-24 md:h-28 mx-auto mb-4 opacity-80 object-contain"
              />
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Entre com sua conta Google para acessar o sistema</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="mt-8 space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 h-10 sm:h-12 text-sm sm:text-base"
                >
                  <FcGoogle className="h-5 w-5" />
                  Entrar com Google
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-2 md:col-start-1 md:row-start-3 md:col-span-1 md:row-span-2">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-center">
              <div className="text-center">
                <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Como Funciona</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-2 text-left">
                  <p>• <strong>Compartilhamento:</strong> Links de vagas</p>
                  <p>• <strong>Notificações:</strong> Sistema interno</p>
                  <p>• <strong>Segurança:</strong> Controle de acesso</p>
                  <p>• <strong>IA:</strong> Análise inteligente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-1 md:col-start-4 md:row-start-3 md:row-span-1">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center text-center">
              {/* CandidateButton removed as it's related to CPF login */}
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-1 md:col-start-2 md:row-start-4 md:row-span-1">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-90" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">98%</div>
                <div className="text-xs sm:text-sm opacity-90">Precisão IA</div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 sm:col-span-2 md:col-start-3 md:row-start-4 md:col-span-2 md:row-span-1 overflow-hidden">
            <CardContent className="p-4 h-full flex items-center">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-400 rounded-full flex-shrink-0 transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg, #10b981, #059669)`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                          {testimonials[currentTestimonial].name}
                        </h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {testimonials[currentTestimonial].role} - {testimonials[currentTestimonial].company}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                        {testimonials[currentTestimonial].content}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mt-3">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-emerald-600' : 'bg-emerald-300'}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}