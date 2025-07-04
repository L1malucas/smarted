"use client"

import { createContext, useContext, useState } from "react"
import { LoadingContextType } from "@/types/loading-interface"
import CustomLoading from "@/components/loading"

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => { },
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && (
        <CustomLoading />
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
