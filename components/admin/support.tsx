// components/admin/Support.tsx
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { withActionLogging } from "@/lib/actions"

// Mock service for support requests
const supportService = {
  submitRequest: async (subject: string, message: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  },
};

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitAction = withActionLogging(
      async () => {
        await supportService.submitRequest(subject, message);
      },
      {
        userId: "admin-user", // Placeholder: replace with actual user ID
        userName: "Admin User", // Placeholder: replace with actual user name
        actionType: "submit_support_request",
        resourceType: "support",
        details: `Support request submitted: ${subject}`,
        successMessage: "Sua solicitação de suporte foi enviada com sucesso. Em breve entraremos em contato.",
        errorMessage: "Não foi possível enviar sua solicitação de suporte. Por favor, tente novamente.",
      }
    );

    try {
      await submitAction();
      setSubject("");
      setMessage("");
    } catch (error) {
      // Error already handled by withActionLogging
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulo de Suporte</CardTitle>
        <CardDescription>Relate problemas ou tire dúvidas sobre o sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto da sua solicitação"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva seu problema ou dúvida aqui..."
              rows={5}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
        <p className="text-muted-foreground">
          Para relatar um problema, por favor, envie um email para:{" "}
          <a href="mailto:suporte@smarted.com" className="text-blue-500 hover:underline">
            suporte@smarted.com
          </a>
        </p>
        <p className="text-muted-foreground">
          Você também pode consultar nossa{" "}
          <a href="#" className="text-blue-500 hover:underline">
            FAQ e Documentação
          </a>
          .
        </p>
      </CardContent>
    </Card>
  )
}