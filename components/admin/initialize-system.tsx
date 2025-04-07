"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface InitializeSystemProps {
  wallet: any
  onInitialize: (account: string) => void
}

export default function InitializeSystem({ wallet, onInitialize }: InitializeSystemProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; account?: string } | null>(null)
  const [votingName, setVotingName] = useState("Community Election 2025")
  const [votingDescription, setVotingDescription] = useState(
    "Official community election for selecting representatives.",
  )
  const [enablePublicResults, setEnablePublicResults] = useState(true)
  const [allowVoterRegistration, setAllowVoterRegistration] = useState(true)

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Initialize Voting System</h2>
      <p className="text-muted-foreground">
        Create a new voting account on the Solana blockchain. This will be the central account that stores all
        candidates and votes.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Voting System Configuration</CardTitle>
          <CardDescription>Configure the basic settings for your voting system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voting-name">Voting Name</Label>
            <Input
              id="voting-name"
              value={votingName}
              onChange={(e) => setVotingName(e.target.value)}
              placeholder="Enter a name for this voting system"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voting-description">Description</Label>
            <Input
              id="voting-description"
              value={votingDescription}
              onChange={(e) => setVotingDescription(e.target.value)}
              placeholder="Enter a description for this voting system"
            />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public-results"
                checked={enablePublicResults}
                onCheckedChange={(checked) => setEnablePublicResults(checked as boolean)}
              />
              <Label htmlFor="public-results">Enable public results</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="voter-registration"
                checked={allowVoterRegistration}
                onCheckedChange={(checked) => setAllowVoterRegistration(checked as boolean)}
              />
              <Label htmlFor="voter-registration">Allow voter registration</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">A small amount of SOL will be required to create this account</p>
          <Button onClick={handleInitialize} disabled={isInitializing}>
            {isInitializing ? "Initializing..." : "Initialize System"}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Alert
          className={result.success ? "bg-green-500/10 border-green-500/50" : "bg-destructive/10 border-destructive/50"}
        >
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
          {result.success && result.account && <p className="mt-2 text-xs break-all">Account: {result.account}</p>}
        </Alert>
      )}
    </div>
  )
}

