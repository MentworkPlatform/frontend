"use client"

import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoadingSpinner() {
  return (
    <div className="h-5 w-5 animate-spin">
      <Loader2 className="h-5 w-5" />
    </div>
  )
}

interface ErrorAlertProps {
  title?: string
  message: string
  retry?: () => void
}

export function ErrorAlert({ title = "Error", message, retry }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} className="self-start">
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

interface SuccessAlertProps {
  title?: string
  message: string
}

export function SuccessAlert({ title = "Success", message }: SuccessAlertProps) {
  return (
    <Alert className="mb-4 border-green-500 text-green-500">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
