
import * as React from "react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  // Pour l'instant, on utilise console.log
  console.log(`Toast ${variant}:`, title, description)
  
  return {
    id: Date.now().toString(),
    dismiss: () => {}
  }
}

export const useToast = () => {
  return { toast }
}