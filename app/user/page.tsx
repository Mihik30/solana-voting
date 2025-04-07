"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VoteComponent from "@/components/vote-component"
import VotingResults from "@/components/voting-results"
import CandidateProfiles from "@/components/user/candidate-profiles"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft, Vote, BarChart3, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import WalletConnect from "@/components/wallet-connect"
import { isValidPublicKey } from "@/utils/solana-program"
import { useConnection } from "@solana/wallet-adapter-react"

export default function UserPage() {
  const { wallet, solanaWallet, connected, connectWallet, disconnectWallet, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [votingAccount, setVotingAccount] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("candidates")
  const [hasVoted, setHasVoted] = useState(false)

  // This would typically come from your environment variables or configuration
  const defaultVotingAccount = "VoteAccountAddressForYourElection2025"

  // Initialize default candidates in localStorage if they don't exist
  useEffect(() => {
    const initializeCandidates = () => {
      if (!localStorage.getItem("voting_candidates")) {
        const defaultCandidates = [
          { name: "Alice Johnson", description: "Progressive Party candidate", votes: 12 },
          { name: "Bob Smith", description: "Conservative Alliance candidate", votes: 8 },
          { name: "Charlie Davis", description: "Independent candidate", votes: 15 },
          { name: "Diana Miller", description: "Green Future candidate", votes: 5 },
        ]
        localStorage.setItem("voting_candidates", JSON.stringify(defaultCandidates))
      }
    }

    initializeCandidates()
  }, [])

  useEffect(() => {
    // If we have a voting account in localStorage, use it
    const savedAccount = localStorage.getItem("votingAccount")
    if (savedAccount && isValidPublicKey(savedAccount)) {
      setVotingAccount(savedAccount)
    } else {
      // Otherwise use the default
      setVotingAccount(defaultVotingAccount)
    }
  }, [])

  useEffect(() => {
    // Check if the user has voted when wallet connects
    const checkVoteStatus = async () => {
      if (connected && solanaWallet) {
        try {
          const walletAddress = solanaWallet.toString()
          const votedData = localStorage.getItem(`voted_${walletAddress}`)

          if (votedData) {
            setHasVoted(true)
          } else {
            setHasVoted(false)
          }
        } catch (error) {
          console.error("Error checking vote status:", error)
          setHasVoted(false)
        }
      } else {
        setHasVoted(false)
      }
    }

    checkVoteStatus()
  }, [connected, solanaWallet])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Header
        connected={connected}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        walletAddress={wallet?.publicKey}
        isAdmin={false}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Voter Dashboard
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="border-border/40 shadow-xl">
              <CardContent className="p-0">
                {connected ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full rounded-none">
                      <TabsTrigger value="candidates">
                        <Users className="h-4 w-4 mr-2" />
                        Candidates
                      </TabsTrigger>
                      <TabsTrigger value="vote">
                        <Vote className="h-4 w-4 mr-2" />
                        Vote
                        {hasVoted && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                      </TabsTrigger>
                      <TabsTrigger value="results">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Results
                      </TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                      <TabsContent value="candidates" className="m-0">
                        <CandidateProfiles votingAccount={votingAccount} />
                      </TabsContent>

                      <TabsContent value="vote" className="m-0">
                        <VoteComponent
                          wallet={wallet}
                          solanaWallet={solanaWallet}
                          votingAccount={votingAccount}
                          sendTransaction={sendTransaction}
                        />
                      </TabsContent>

                      <TabsContent value="results" className="m-0">
                        <VotingResults votingAccount={votingAccount} />
                      </TabsContent>
                    </div>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <WalletConnect connected={connected} onConnect={connectWallet} className="mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                    <p className="text-muted-foreground max-w-md">
                      Connect your Solana wallet to participate in the voting process. You'll be able to view candidate
                      profiles, cast votes, and check results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <Card className="border-border/40 shadow-xl h-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Voter Information
                </h2>
                <p className="text-muted-foreground mb-6">
                  Welcome to the Solana Voting System. As a voter, you can view candidate profiles, cast your vote, and
                  check the current results.
                </p>

                {connected && (
                  <div className="space-y-4 mt-6 pt-6 border-t border-border/40">
                    <h3 className="text-sm font-medium">Your Voting Status</h3>
                    <div className="flex items-center gap-2">
                      {hasVoted ? (
                        <>
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Vote Cast</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You have already cast your vote in this election.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-yellow-500">
                            <Vote className="h-5 w-5" />
                            <span className="font-medium">Not Voted</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You have not yet cast your vote in this election.
                          </p>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("vote")}
                        className="justify-start"
                        disabled={hasVoted}
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        {hasVoted ? "Already Voted" : "Cast Vote"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("results")}
                        className="justify-start"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mt-6 pt-6 border-t border-border/40">
                  <h3 className="text-sm font-medium">Voting Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="text-sm font-medium">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          Active
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Network:</span>
                      <span className="text-sm font-medium">Solana Devnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="text-sm font-medium">April 15, 2025</span>
                    </div>
                  </div>
                </div>

                {votingAccount && (
                  <div className="space-y-2 mt-6 pt-6 border-t border-border/40">
                    <h3 className="text-sm font-medium">Current Voting Account</h3>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs font-mono break-all">{votingAccount}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

