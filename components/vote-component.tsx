"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, Vote, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useConnection } from "@solana/wallet-adapter-react"
import type { PublicKey } from "@solana/web3.js"

interface Candidate {
  index: number
  name: string
  votes: number
  description?: string
}

interface VoteComponentProps {
  wallet: any
  solanaWallet: PublicKey | null
  votingAccount: string | null
  sendTransaction: any
}

export default function VoteComponent({ wallet, solanaWallet, votingAccount, sendTransaction }: VoteComponentProps) {
  const { connection } = useConnection()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<{ candidateIndex: number; candidateName: string } | null>(null)

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
    const fetchCandidatesAndVoteStatus = async () => {
      if (!votingAccount || !solanaWallet) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Check if the current wallet has already voted
        const walletAddress = solanaWallet.toString()
        const votedData = localStorage.getItem(`voted_${walletAddress}`)

        if (votedData) {
          const parsedData = JSON.parse(votedData)
          setHasVoted(true)
          setUserVote({
            candidateIndex: parsedData.candidateIndex,
            candidateName: parsedData.candidateName,
          })
        } else {
          setHasVoted(false)
          setUserVote(null)
        }

        // Get candidates from localStorage
        const storedCandidates = getCandidatesFromStorage()

        // Transform candidates data
        const candidatesData = storedCandidates.map((candidate, index) => ({
          index,
          name: candidate.name,
          votes: candidate.votes,
          description: candidate.description,
        }))

        setCandidates(candidatesData)
      } catch (error) {
        console.error("Failed to fetch candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidatesAndVoteStatus()
  }, [votingAccount, solanaWallet])

  const handleVoteClick = () => {
    if (selectedCandidate !== null) {
      setShowConfirmDialog(true)
    }
  }

  const handleVote = async () => {
    setShowConfirmDialog(false)

    if (!solanaWallet || !votingAccount || selectedCandidate === null) {
      setResult({
        success: false,
        message: "Please select a candidate to vote for",
      })
      return
    }

    if (hasVoted) {
      setResult({
        success: false,
        message: "You have already cast your vote in this election",
      })
      return
    }

    setIsVoting(true)
    setResult(null)

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update candidates in localStorage
      const storedCandidates = getCandidatesFromStorage()
      storedCandidates[selectedCandidate].votes += 1
      localStorage.setItem("voting_candidates", JSON.stringify(storedCandidates))

      // Store vote in localStorage
      const walletAddress = solanaWallet.toString()
      localStorage.setItem(
        `voted_${walletAddress}`,
        JSON.stringify({
          candidateIndex: selectedCandidate,
          candidateName: candidates[selectedCandidate].name,
          timestamp: Date.now(),
        }),
      )

      setResult({
        success: true,
        message: `Vote cast successfully for ${candidates[selectedCandidate].name}!`,
      })

      // Update local state to reflect the vote
      setCandidates((prev) =>
        prev.map((candidate, index) =>
          index === selectedCandidate ? { ...candidate, votes: candidate.votes + 1 } : candidate,
        ),
      )

      setHasVoted(true)
      setUserVote({
        candidateIndex: selectedCandidate,
        candidateName: candidates[selectedCandidate].name,
      })
      setSelectedCandidate(null)
    } catch (error) {
      console.error("Error casting vote:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to cast vote",
      })
    } finally {
      setIsVoting(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cast Your Vote</h2>
        {isVoting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing transaction...
          </div>
        )}
      </div>

      {hasVoted && userVote && (
        <Alert className="bg-blue-500/10 border-blue-500/50">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>You have already voted</AlertTitle>
          <AlertDescription>
            You have cast your vote for <strong>{userVote.candidateName}</strong> in this election. Each wallet can only
            vote once.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : candidates.length > 0 ? (
        <RadioGroup
          value={selectedCandidate?.toString()}
          onValueChange={(value) => setSelectedCandidate(Number.parseInt(value))}
          className="space-y-4"
          disabled={hasVoted}
        >
          <AnimatePresence>
            {candidates.map((candidate) => (
              <motion.div
                key={candidate.index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`overflow-hidden transition-all ${
                    selectedCandidate === candidate.index ? "border-primary" : ""
                  } ${hasVoted ? "opacity-70" : ""}`}
                >
                  <CardContent className="p-0">
                    <label
                      htmlFor={`candidate-${candidate.index}`}
                      className={`flex items-start p-4 ${hasVoted ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <RadioGroupItem
                        value={candidate.index.toString()}
                        id={`candidate-${candidate.index}`}
                        className="mt-1"
                        disabled={hasVoted}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(candidate.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {candidate.name}
                              {userVote && userVote.candidateIndex === candidate.index && (
                                <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                  Your Vote
                                </span>
                              )}
                            </h3>
                            {candidate.description && (
                              <p className="text-sm text-muted-foreground mt-1">{candidate.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </RadioGroup>
      ) : (
        <div className="text-center py-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No candidates found. Please add candidates first.</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Alert
              className={`${
                result.success ? "bg-green-500/10 border-green-500/50" : "bg-destructive/10 border-destructive/50"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleVoteClick}
        disabled={isVoting || selectedCandidate === null || candidates.length === 0 || hasVoted}
        className="w-full"
      >
        {isVoting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Casting Vote...
          </>
        ) : hasVoted ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Vote Already Cast
          </>
        ) : (
          <>
            <Vote className="mr-2 h-4 w-4" />
            Cast Vote
          </>
        )}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              You are about to cast a vote for {selectedCandidate !== null && candidates[selectedCandidate]?.name}. This
              action cannot be undone and you can only vote once in this election.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote}>Confirm Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

