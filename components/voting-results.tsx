"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, Trophy, Medal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Candidate {
  name: string
  votes: number
}

interface VotingResultsProps {
  votingAccount: string | null
}

export default function VotingResults({ votingAccount }: VotingResultsProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"bar" | "pie">("bar")

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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

  const fetchResults = async () => {
    if (!votingAccount) {
      setError("No voting account specified")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get candidates from localStorage
      const storedCandidates = getCandidatesFromStorage()

      // Transform to the format needed for this component
      const candidateData = storedCandidates.map((candidate) => ({
        name: candidate.name,
        votes: candidate.votes,
      }))

      setCandidates(candidateData)
      setTotalVotes(candidateData.reduce((sum, candidate) => sum + candidate.votes, 0))
    } catch (err) {
      console.error("Failed to fetch voting results:", err)
      setError("Failed to fetch voting results. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [votingAccount])

  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return (votes / totalVotes) * 100
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes)

  const getLeaderIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />
    return null
  }

  const pieData = candidates.map((candidate) => ({
    name: candidate.name,
    value: candidate.votes,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Voting Results</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "bar" ? "pie" : "bar")}>
            {viewMode === "bar" ? "Pie Chart" : "Bar Chart"}
          </Button>
          <Button variant="outline" size="icon" onClick={fetchResults} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-destructive">{error}</p>
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Total votes: <span className="font-medium text-foreground">{totalVotes}</span>
          </div>

          {viewMode === "bar" ? (
            <div className="space-y-6">
              {sortedCandidates.map((candidate, index) => (
                <motion.div
                  key={index}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getLeaderIcon(index)}
                      <span className="font-medium">{candidate.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {candidate.votes} votes ({getVotePercentage(candidate.votes).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getVotePercentage(candidate.votes)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} votes`, "Votes"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No voting data available yet.</p>
        </div>
      )}
    </div>
  )
}

