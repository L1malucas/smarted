"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ApplicationSuccessPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobSlug = params.jobSlug as string

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Candidatura Enviada com Sucesso!</CardTitle>
          <CardDescription className="text-lg">
            Sua candidatura foi recebida e está sendo analisada pela nossa equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-blue-900">Próximos Passos:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Você receberá um email de confirmação em breve</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Nossa equipe analisará seu perfil nos próximos dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Entraremos em contato caso seu perfil seja selecionado</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-600">Obrigado pelo seu interesse em fazer parte da nossa equipe!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href={`/public/${tenantSlug}/jobs`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ver Outras Vagas
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/public/${tenantSlug}/jobs/${jobSlug}`}>Voltar à Vaga</Link>
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>
              Powered by <span className="font-semibold text-blue-600">SMARTED TECH SOLUTIONS</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
