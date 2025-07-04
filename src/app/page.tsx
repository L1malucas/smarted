// app/page.tsx (HomePage)

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login")
    }, 300) // tempo opcional para o loading aparecer
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">Carregando...</p>
    </div>
  )
}
