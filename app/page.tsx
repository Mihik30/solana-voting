"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Users, Vote, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import WalletConnect from "@/components/wallet-connect"

export default function Home() {
  const { wallet, connected, connectWallet, disconnectWallet } = useWallet()
  const [votingAccount, setVotingAccount] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // This would typically come from your environment variables or configuration
  const defaultVotingAccount = "VoteAccountAddressForYourElection2025"

  useEffect(() => {
    // If we have a voting account in localStorage, use it
    const savedAccount = localStorage.getItem("votingAccount")
    if (savedAccount) {
      setVotingAccount(savedAccount)
    } else {
      // Otherwise use the default
      setVotingAccount(defaultVotingAccount)
    }
  }, [])

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
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-8">
          <motion.div variants={item}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl font-bold mb-4">Solana Voting System</h1>
              <p className="text-xl text-muted-foreground">
                A decentralized voting platform built on the Solana blockchain. Cast your votes securely and
                transparently with the power of blockchain technology.
              </p>

              {!connected && (
                <div className="mt-8">
                  <WalletConnect connected={connected} onConnect={connectWallet} />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/40 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Voter Dashboard</h2>
                    <p className="text-muted-foreground mb-6">
                      View candidate profiles, cast your vote, and check the current results. Participate in the
                      democratic process with ease.
                    </p>
                    <Button onClick={() => router.push("/user")} className="w-full">
                      Go to Voter Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                      <Shield className="h-8 w-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                    <p className="text-muted-foreground mb-6">
                      Manage candidates, control voting periods, and analyze voting data. Administrative tools for
                      election organizers.
                    </p>
                    <Button
                      onClick={() => router.push("/admin")}
                      variant={connected ? "default" : "outline"}
                      className={connected ? "w-full" : "w-full text-muted-foreground"}
                      disabled={!connected}
                    >
                      {connected ? (
                        <>
                          Go to Admin Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Connect wallet to access"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border/40 shadow-xl mt-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Secure</h3>
                    <p className="text-muted-foreground">
                      Built on Solana blockchain with cryptographic security to ensure vote integrity.
                    </p>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Vote className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Transparent</h3>
                    <p className="text-muted-foreground">
                      All votes are recorded on the blockchain and can be independently verified.
                    </p>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Accessible</h3>
                    <p className="text-muted-foreground">Easy-to-use interface for both voters and administrators.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

