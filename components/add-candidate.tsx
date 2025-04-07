"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface AddCandidateProps {
  wallet: any
  votingAccount: string | null
}

export default function AddCandidate({ wallet, votingAccount }: AddCandidateProps) {
  const [candidateName, setCandidateName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet || !votingAccount) {
      setResult({
        success: false,
        message: "Wallet not connected or voting account not set",
      })
      return
    }

    if (!candidateName.trim()) {
      setResult({
        success: false,
        message: "Please enter a candidate name",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      // This would be replaced with actual Solana program interaction
      // Simulating the add candidate process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setResult({
        success: true,
        message: `Candidate "${candidateName}" added successfully!`,
      })

      setCandidateName("")
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to add candidate",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle>Add Candidate</CardTitle>
        <CardDescription className="text-slate-300">Add a new candidate to the voting system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                placeholder="Enter candidate name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </div>
        </form>

        {result && (
          <Alert
            className={`mt-4 ${result.success ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"}`}
          >
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !candidateName.trim()} className="w-full">
          {isSubmitting ? "Adding Candidate..." : "Add Candidate"}
        </Button>
      </CardFooter>
    </Card>
  )
}

