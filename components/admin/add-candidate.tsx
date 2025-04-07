"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface AddCandidateProps {
  wallet: any
  votingAccount: string | null
}

export default function AddCandidate({ wallet, votingAccount }: AddCandidateProps) {
  const [candidateName, setCandidateName] = useState("")
  const [candidateDescription, setCandidateDescription] = useState("")
  const [candidateParty, setCandidateParty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Get candidates from localStorage or use default
  const getCandidatesFromStorage = () => {
    try {
      const storedCandidates = localStorage.getItem("voting_candidates")
      if (storedCandidates) {
        return JSON.parse(storedCandidates)
      }
    } catch (error) {
      console.error("Error parsing stored candidates:", error)
    }

    // Default candidates if none in storage
    return [
      { name: "Alice Johnson", description: "Progressive Party candidate", votes: 12 },
      { name: "Bob Smith", description: "Conservative Alliance candidate", votes: 8 },
      { name: "Charlie Davis", description: "Independent candidate", votes: 15 },
      { name: "Diana Miller", description: "Green Future candidate", votes: 5 },
    ]
  }

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
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get current candidates
      const candidates = getCandidatesFromStorage()

      // Add new candidate
      candidates.push({
        name: candidateName,
        description: candidateDescription || (candidateParty ? `${candidateParty} candidate` : "Independent candidate"),
        party: candidateParty,
        votes: 0,
      })

      // Save to localStorage
      localStorage.setItem("voting_candidates", JSON.stringify(candidates))

      setResult({
        success: true,
        message: `Candidate "${candidateName}" added successfully!`,
      })

      setCandidateName("")
      setCandidateDescription("")
      setCandidateParty("")
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Candidate</CardTitle>
        <CardDescription>Add a new candidate to the voting system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              placeholder="Enter candidate name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidateParty">Party/Affiliation</Label>
            <Input
              id="candidateParty"
              placeholder="Enter party or affiliation (optional)"
              value={candidateParty}
              onChange={(e) => setCandidateParty(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidateDescription">Description</Label>
            <Textarea
              id="candidateDescription"
              placeholder="Enter candidate description"
              value={candidateDescription}
              onChange={(e) => setCandidateDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Candidate Image (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Drag and drop an image here, or click to browse</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or GIF, max 2MB</p>
              <Input type="file" className="hidden" accept="image/*" />
              <Button type="button" variant="outline" size="sm" className="mt-4">
                Upload Image
              </Button>
            </div>
          </div>
        </form>

        {result && (
          <Alert
            className={`mt-4 ${result.success ? "bg-green-500/10 border-green-500/50" : "bg-destructive/10 border-destructive/50"}`}
          >
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
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

