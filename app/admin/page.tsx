"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddCandidate from "@/components/admin/add-candidate"
import ManageCandidates from "@/components/admin/manage-candidates"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, Users, ArrowLeft, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import AdminProtected from "@/components/admin/admin-protected"

export default function AdminPage() {
  const { wallet, connected, connectWallet, disconnectWallet } = useWallet()
  const [votingAccount, setVotingAccount] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("candidates")

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

  const saveVotingAccount = (account: string) => {
    localStorage.setItem("votingAccount", account)
    setVotingAccount(account)
    toast({
      title: "Voting Account Updated",
      description: "Your voting account has been successfully updated.",
    })
  }

  const handleAdminLogout = () => {
    if (wallet) {
      // Remove admin authentication from session storage
      sessionStorage.removeItem(`admin_authenticated_${wallet.publicKey}`)
      toast({
        title: "Logged Out",
        description: "You have been logged out of the admin dashboard.",
      })
      // Redirect to home page
      router.push("/")
    }
  }

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
        isAdmin={true}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="h-5 w-5 mr-2 text-amber-500" />
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminLogout}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Admin Logout
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <AdminProtected wallet={wallet} connected={connected}>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={item} className="lg:col-span-2">
              <Card className="border-border/40 shadow-xl">
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-1 w-full rounded-none">
                      <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                      <TabsContent value="candidates" className="m-0 space-y-6">
                        <AddCandidate wallet={wallet} votingAccount={votingAccount} />
                        <ManageCandidates wallet={wallet} votingAccount={votingAccount} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item} className="lg:col-span-1">
              <Card className="border-border/40 shadow-xl h-full">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-amber-500" />
                    Admin Controls
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    This dashboard provides administrative controls for managing the Solana voting system. Only
                    authorized wallets can access these features.
                  </p>

                  <div className="space-y-4 mt-6 pt-6 border-t border-border/40">
                    <h3 className="text-sm font-medium">Admin Status</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium">Authenticated as Admin</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You are logged in with an authorized admin wallet. You have full access to all administrative
                      functions.
                    </p>
                  </div>

                  <div className="space-y-4 mt-6 pt-6 border-t border-border/40">
                    <h3 className="text-sm font-medium">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("candidates")}
                        className="justify-start"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Candidates
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/user")}
                        className="justify-start"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        User View
                      </Button>
                    </div>
                  </div>

                  {votingAccount && (
                    <div className="space-y-2 mt-6 pt-6 border-t border-border/40">
                      <h3 className="text-sm font-medium">Current Voting Account</h3>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs font-mono break-all">{votingAccount}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This is the account that stores all candidates and votes on the Solana blockchain.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mt-6 pt-6 border-t border-border/40">
                    <h3 className="text-sm font-medium">Network Status</h3>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-sm">Solana Mainnet: Connected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AdminProtected>
      </div>
    </main>
  )
}

