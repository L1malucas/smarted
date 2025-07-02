'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <SearchX className="h-24 w-24 text-muted-foreground/40" />
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Página Não Encontrada
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Oops! Parece que a página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Voltar para a Página Inicial</Link>
        </Button>
      </div>
    </div>
  )
}
