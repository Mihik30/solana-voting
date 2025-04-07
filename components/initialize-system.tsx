"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface InitializeSystemProps {
  wallet: any
  onInitialize: (account: string) => void
}

export default function InitializeSystem({ wallet, onInitialize }: InitializeSystemProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; account?: string } | null>(null)

  const handleInitialize = async () => {
    if (!wallet) return

    setIsInitializing(true)
    setResult(null)

    try {
      // This would be replaced with actual Solana program interaction
      // Simulating the initialization process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a mock public key for demo purposes
      const mockPublicKey = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      setResult({
        success: true,
        message: "Voting system initialized successfully!",
        account: mockPublicKey,
      })

      onInitialize(mockPublicKey)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to initialize voting system",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle>Initialize Voting System</CardTitle>
        <CardDescription className="text-slate-300">
          Create a new voting account on the Solana blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-slate-300 mb-6">
          This will create a new voting account that will store all candidates and votes. You will need to pay a small
          amount of SOL to cover the storage costs.
        </p>

        {result && (
          <Alert className={result.success ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
            {result.success && result.account && (
              <p className="mt-2 text-xs text-slate-300 break-all">Account: {result.account}</p>
            )}
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleInitialize} disabled={isInitializing} className="w-full">
          {isInitializing ? "Initializing..." : "Initialize Voting System"}
        </Button>
      </CardFooter>
    </Card>
  )
}

