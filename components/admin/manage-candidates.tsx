"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Candidate {
  id: string
  name: string
  party?: string
  description?: string
  votes: number
}

interface ManageCandidatesProps {
  wallet: any
  votingAccount: string | null
}

export default function ManageCandidates({ wallet, votingAccount }: ManageCandidatesProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

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

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!votingAccount) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get candidates from localStorage
        const storedCandidates = getCandidatesFromStorage()

        // Transform to the format needed for this component
        const candidateData = storedCandidates.map((candidate, index) => ({
          id: `cand_${index + 1}`,
          name: candidate.name,
          party:
            candidate.party ||
            (candidate.name.includes("Progressive")
              ? "Progressive Party"
              : candidate.name.includes("Conservative")
                ? "Conservative Alliance"
                : candidate.name.includes("Green")
                  ? "Green Future"
                  : "Independent"),
          description: candidate.description,
          votes: candidate.votes,
        }))

        setCandidates(candidateData)
      } catch (error) {
        console.error("Failed to fetch candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidates()
  }, [votingAccount])

  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get current candidates
      const storedCandidates = getCandidatesFromStorage()

      // Find the index of the candidate to delete
      const indexToDelete = storedCandidates.findIndex((c: any) => c.name === selectedCandidate.name)

      if (indexToDelete !== -1) {
        // Remove the candidate
        storedCandidates.splice(indexToDelete, 1)

        // Save updated candidates to localStorage
        localStorage.setItem("voting_candidates", JSON.stringify(storedCandidates))

        // Update local state
        setCandidates(candidates.filter((c) => c.id !== selectedCandidate.id))

        toast({
          title: "Candidate Removed",
          description: `${selectedCandidate.name} has been removed from the ballot.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove candidate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setSelectedCandidate(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : candidates.length > 0 ? (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    {candidate.party && <p className="text-sm text-muted-foreground">{candidate.party}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedCandidate(candidate)
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No candidates found. Add candidates using the form above.</p>
          </div>
        )}

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedCandidate?.name} from the ballot? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCandidate}>
                Delete Candidate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

