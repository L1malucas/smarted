"use client"

import { createContext, useContext, useState } from "react"
import CustomLoading from "../loading"
import { ILoadingContextType } from "@/shared/types/types/loading-interface"

const LoadingContext = createContext<ILoadingContextType>({
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
