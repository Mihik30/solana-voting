"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Menu, X, Shield, Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { isAdminWallet } from "@/utils/admin-auth"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  connected: boolean
  onConnect: () => void
  onDisconnect: () => void
  walletAddress?: string
  isAdmin?: boolean
}

export default function Header({ connected, onConnect, onDisconnect, walletAddress, isAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdminWalletConnected, setIsAdminWalletConnected] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (connected && walletAddress) {
      // Check if this is an admin wallet
      const adminWallet = isAdminWallet(walletAddress)
      setIsAdminWalletConnected(adminWallet)

      // Check if admin is authenticated
      if (adminWallet) {
        const authenticated = sessionStorage.getItem(`admin_authenticated_${walletAddress}`) === "true"
        setIsAdminAuthenticated(authenticated)
      } else {
        setIsAdminAuthenticated(false)
      }
    } else {
      setIsAdminWalletConnected(false)
      setIsAdminAuthenticated(false)
    }
  }, [connected, walletAddress])

  const truncateAddress = (address?: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">SV</span>
            </div>
            <span className="font-bold text-lg hidden md:inline-block">Solana Vote</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/user" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Voter Dashboard
          </Link>
          {connected && isAdminWalletConnected && (
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Admin
              {isAdminAuthenticated && (
                <Badge className="ml-1 bg-green-500/20 text-green-500 border-green-500/10 text-[10px] py-0">
                  Authenticated
                </Badge>
              )}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {connected ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <div className="text-xs text-muted-foreground">Connected Wallet</div>
                <div className="text-sm font-medium flex items-center">
                  {truncateAddress(walletAddress)}
                  {isAdminWalletConnected && (
                    <Badge className="ml-2 bg-amber-500/20 text-amber-500 border-amber-500/10">Admin</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button onClick={onConnect} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className={cn("md:hidden overflow-hidden", mobileMenuOpen ? "block" : "hidden")}
        initial={{ height: 0 }}
        animate={{ height: mobileMenuOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container py-4 space-y-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/user"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4 mr-1" />
              Voter Dashboard
            </Link>
            {connected && isAdminWalletConnected && (
              <Link
                href="/admin"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
                {isAdminAuthenticated && (
                  <Badge className="ml-1 bg-green-500/20 text-green-500 border-green-500/10 text-[10px] py-0">
                    Authenticated
                  </Badge>
                )}
              </Link>
            )}
          </nav>
        </div>
      </motion.div>
    </header>
  )
}

