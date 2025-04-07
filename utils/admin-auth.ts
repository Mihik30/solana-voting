// Replace these with your actual admin wallet addresses
const ADMIN_WALLETS = [
  "YourActualPhantomWalletAddressHere",
  "AnotherAdminWalletAddress",
  // Add more admin wallet addresses as needed
]

export function isAdminWallet(walletAddress: string | undefined): boolean {
  if (!walletAddress) return false

  // For development purposes, you might want to make all wallets admin
  // Remove this in production
  // Temporarily allow all wallets to be admin for testing
  return true

  // When you're ready to restrict access, uncomment this line and add your wallet address to ADMIN_WALLETS
  // return ADMIN_WALLETS.includes(walletAddress)
}

// In a real application, you might want to implement more sophisticated
// authentication methods like JWT tokens, signatures, etc.
export function verifyAdminSignature(walletAddress: string, signature: string): boolean {
  // In a real app, this would verify a cryptographic signature
  // For now, we'll just check if the wallet is in our admin list
  return isAdminWallet(walletAddress)
}

