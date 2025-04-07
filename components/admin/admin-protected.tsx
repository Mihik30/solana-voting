"use client"

import type React from "react"

import { type ReactNode, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import WalletConnect from "@/components/wallet-connect"
import { isAdminWallet } from "@/utils/admin-auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AdminProtectedProps {
  children: ReactNode
  wallet: any
  connected: boolean
}

export default function AdminProtected({ children, wallet, connected }: AdminProtectedProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Secret admin code for additional security (in a real app, this would be more secure)
  const ADMIN_SECRET_CODE = "admin123"

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!connected || !wallet) {
        setIsAdmin(false)
        setIsChecking(false)
        return
      }

      try {
        // Check if the wallet is in our admin list
        const walletIsAdmin = isAdminWallet(wallet.publicKey)

        // Check if the admin has already been authenticated in this session
        const adminAuthenticated = sessionStorage.getItem(`admin_authenticated_${wallet.publicKey}`) === "true"

        if (walletIsAdmin && adminAuthenticated) {
          setIsAdmin(true)
          setShowLoginForm(false)
        } else if (walletIsAdmin) {
          // Wallet is an admin but needs to enter the code
          setShowLoginForm(true)
          setIsAdmin(false)
        } else {
          // Not an admin wallet
          setIsAdmin(false)
          setShowLoginForm(false)
        }
      } catch (error) {
        console.error("Failed to check admin status:", error)
        setIsAdmin(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminStatus()
  }, [connected, wallet])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) return

    setIsSubmitting(true)

    try {
      // In a real app, this would be a secure verification process
      // For demo, we're just checking against a hardcoded value
      if (adminCode === ADMIN_SECRET_CODE) {
        // Store authentication in session storage
        sessionStorage.setItem(`admin_authenticated_${wallet.publicKey}`, "true")

        setIsAdmin(true)
        setShowLoginForm(false)

        toast({
          title: "Admin Access Granted",
          description: "You have successfully logged in as an administrator.",
        })
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Admin login error:", error)
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isChecking) {
    return (
      <Card className="border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!connected) {
    return (
      <Card className="border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Please connect your wallet to access the admin dashboard.
            </p>
            <WalletConnect connected={connected} onConnect={() => {}} />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showLoginForm) {
    return (
      <Card className="border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lock className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Admin Authentication</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your wallet is recognized as an admin wallet. Please enter your admin code to continue.
            </p>

            <form onSubmit={handleAdminLogin} className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Enter your admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAdmin) {
    return (
      <Card className="border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your wallet does not have admin privileges. Please connect with an authorized admin wallet to access this
              page.
            </p>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

