"use client"

import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { isAdminWallet } from "@/utils/admin-auth"

export function useWallet() {
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    select,
    wallets,
    wallet,
    signTransaction,
    signAllTransactions,
    sendTransaction,
  } = useSolanaWallet()

  const { connection } = useConnection()
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if the connected wallet is an admin wallet
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString()
      setIsAdmin(isAdminWallet(walletAddress))
    } else {
      setIsAdmin(false)
    }
  }, [connected, publicKey])

  // Connect to Phantom wallet
  const connectWallet = async () => {
    try {
      // Find the Phantom wallet adapter
      const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom")
      if (phantomWallet) {
        select(phantomWallet.adapter.name)
      } else {
        throw new Error("Phantom wallet not found. Please install Phantom wallet extension.")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    disconnect()

    // Clear any admin authentication
    if (publicKey) {
      sessionStorage.removeItem(`admin_authenticated_${publicKey.toString()}`)
    }
  }

  return {
    wallet: publicKey ? { publicKey: publicKey.toString() } : null,
    solanaWallet: publicKey,
    connected,
    connecting,
    isAdmin,
    connectWallet,
    disconnectWallet,
    signTransaction,
    signAllTransactions,
    sendTransaction,
    connection,
  }
}

