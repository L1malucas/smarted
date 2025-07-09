// components/admin/Support.tsx
import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/shared/components/ui/input";
import { Button } from "../ui/button";
import { Label } from "@/shared/components/ui/label"; // Corrected import
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/shared/hooks/use-toast"; // Import useToast

// Mock service for support requests
const supportService = {
  submitRequest: async (subject: string, message: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate a potential error for testing purposes
    // if (Math.random() > 0.5) {
    //   throw new Error("Simulated network error");
    // }
  },
};

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast(); // Initialize useToast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await supportService.submitRequest(subject, message);
      setSubject("");
      setMessage("");
      toast({
        title: "Sucesso!",
        description: "Sua solicitação de suporte foi enviada com sucesso. Em breve entraremos em contato.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar sua solicitação de suporte. Por favor, tente novamente.",
        variant: "destructive",
      });
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
          <Link href="/faq" className="text-blue-500 hover:underline">
            FAQ e Documentação
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  )
}