"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, CheckCircle, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Transaction {
  id: string
  type: "vote" | "add_candidate" | "initialize"
  status: "confirmed" | "pending" | "failed"
  timestamp: number
  details: {
    candidateName?: string
    candidateIndex?: number
    votingAccount?: string
  }
}

interface TransactionHistoryProps {
  wallet: any
  votingAccount: string | null
}

export default function TransactionHistory({ wallet, votingAccount }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<{ candidateIndex: number; candidateName: string; timestamp: number } | null>(
    null,
  )

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!wallet || !votingAccount) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Check if the current wallet has already voted
        // In a real app, this would query the blockchain
        // For demo purposes, we'll check localStorage
        const votedData = localStorage.getItem(`voted_${wallet.publicKey}_${votingAccount}`)

        if (votedData) {
          const parsedData = JSON.parse(votedData)
          setHasVoted(true)
          setUserVote({
            candidateIndex: parsedData.candidateIndex,
            candidateName: parsedData.candidateName,
            timestamp: parsedData.timestamp,
          })
        } else {
          setHasVoted(false)
          setUserVote(null)
        }

        // This would be replaced with actual Solana program interaction
        // Simulating fetching transaction history
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock data
        let mockTransactions: Transaction[] = [
          {
            id: "5xGrT9Hs2LmQhUj8KpVq4Zb3FcDvYNgP7RkW1XyE6aTc",
            type: "add_candidate",
            status: "confirmed",
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
            details: {
              candidateName: "Diana Miller",
            },
          },
          {
            id: "9zY8xW7vU6tS5rQ4pO3nM2lK1jI0hG9fE8dC7bA6",
            type: "vote",
            status: "failed",
            timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
            details: {
              candidateName: "Bob Smith",
              candidateIndex: 1,
            },
          },
          {
            id: "3qP2oN1mL0kJ9iH8gF7eD6cB5aA4zY3xW2vU1tS0",
            type: "initialize",
            status: "confirmed",
            timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
            details: {
              votingAccount: votingAccount || "",
            },
          },
        ]

        // If the user has voted, add their vote to the transaction history
        if (hasVoted && userVote) {
          mockTransactions = [
            {
              id: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
              type: "vote",
              status: "confirmed",
              timestamp: userVote.timestamp,
              details: {
                candidateName: userVote.candidateName,
                candidateIndex: userVote.candidateIndex,
              },
            },
            ...mockTransactions,
          ]
        }

        setTransactions(mockTransactions)
      } catch (error) {
        console.error("Failed to fetch transaction history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [wallet, votingAccount])

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "vote":
        return "Vote Cast"
      case "add_candidate":
        return "Add Candidate"
      case "initialize":
        return "Initialize System"
      default:
        return "Transaction"
    }
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
      </div>

      {hasVoted && userVote && (
        <Alert className="bg-blue-500/10 border-blue-500/50">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>Your Vote</AlertTitle>
          <AlertDescription>
            You voted for <strong>{userVote.candidateName}</strong> on {formatTimestamp(userVote.timestamp)}.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </span>
                        </Badge>
                        <span className="font-medium">{getTransactionTypeLabel(transaction.type)}</span>
                        {transaction.type === "vote" &&
                          transaction.details.candidateName === userVote?.candidateName && (
                            <Badge className="bg-primary/20 text-primary border-primary/10">Your Vote</Badge>
                          )}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatTimestamp(transaction.timestamp)}</p>
                      <div className="mt-2">
                        {transaction.type === "vote" && transaction.details.candidateName && (
                          <p className="text-sm">
                            Voted for: <span className="font-medium">{transaction.details.candidateName}</span>
                          </p>
                        )}
                        {transaction.type === "add_candidate" && transaction.details.candidateName && (
                          <p className="text-sm">
                            Added candidate: <span className="font-medium">{transaction.details.candidateName}</span>
                          </p>
                        )}
                        {transaction.type === "initialize" && transaction.details.votingAccount && (
                          <p className="text-sm">Created voting account</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={`https://explorer.solana.com/tx/${transaction.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View on Solana Explorer</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No transaction history found.</p>
        </div>
      )}
    </div>
  )
}

