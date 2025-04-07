"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

interface WalletConnectProps {
  connected: boolean
  onConnect: () => void
  className?: string
}

export default function WalletConnect({ connected, onConnect, className }: WalletConnectProps) {
  const { setVisible } = useWalletModal()

  const handleConnect = () => {
    if (!connected) {
      // Open the wallet modal
      setVisible(true)
    } else {
      onConnect()
    }
  }

  return (
    <motion.div
      className={cn("flex justify-center", className)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Button
        onClick={handleConnect}
        variant={connected ? "outline" : "default"}
        size="lg"
        className={cn("px-8 py-6 text-lg", connected ? "border-green-500 text-green-500" : "")}
      >
        <Wallet className="mr-2 h-5 w-5" />
        {connected ? "Wallet Connected" : "Connect Wallet"}
      </Button>
    </motion.div>
  )
}

