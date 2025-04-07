import {
  type Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js"
import * as borsh from "borsh"

// Replace with your deployed program ID - using a valid base58 string
export const PROGRAM_ID = new PublicKey("11111111111111111111111111111111")

// Define the schema for borsh serialization
class VotingInstruction {
  instruction: number
  data: any

  constructor(props: { instruction: number; data: any }) {
    this.instruction = props.instruction
    this.data = props.data
  }

  static initialize(name: string, description: string) {
    return new VotingInstruction({
      instruction: 0,
      data: { name, description },
    })
  }

  static addCandidate(name: string, description: string) {
    return new VotingInstruction({
      instruction: 1,
      data: { name, description },
    })
  }

  static vote(candidateIndex: number) {
    return new VotingInstruction({
      instruction: 2,
      data: { candidate_index: candidateIndex },
    })
  }

  static setVotingPeriod(startTime: number, endTime: number) {
    return new VotingInstruction({
      instruction: 3,
      data: { start_time: startTime, end_time: endTime },
    })
  }
}

// Borsh schema definition
const schema = new Map([
  [
    VotingInstruction,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        [
          "data",
          {
            kind: "enum",
            field: "instruction",
            values: [
              {
                kind: "struct",
                fields: [
                  ["name", "string"],
                  ["description", "string"],
                ],
              },
              {
                kind: "struct",
                fields: [
                  ["name", "string"],
                  ["description", "string"],
                ],
              },
              { kind: "struct", fields: [["candidate_index", "u32"]] },
              {
                kind: "struct",
                fields: [
                  ["start_time", "i64"],
                  ["end_time", "i64"],
                ],
              },
            ],
          },
        ],
      ],
    },
  ],
])

// Validate if a string is a valid base58 PublicKey
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch (error) {
    return false
  }
}

// Safely create a PublicKey from a string
export function safeCreatePublicKey(address: string | null): PublicKey | null {
  if (!address) return null

  try {
    return new PublicKey(address)
  } catch (error) {
    console.error("Invalid public key:", error)
    return null
  }
}

// Serialize instruction data
function serializeInstructionData(instruction: VotingInstruction): Buffer {
  const buffer = borsh.serialize(schema, instruction)
  return Buffer.from(buffer)
}

// Find PDA for voting account
export async function findVotingAccountPDA(name: string, adminPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("voting"), Buffer.from(name), adminPubkey.toBuffer()],
    PROGRAM_ID,
  )
}

// Find PDA for vote record
export async function findVoteRecordPDA(voterPubkey: PublicKey, votingAccountPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vote_record"), voterPubkey.toBuffer(), votingAccountPubkey.toBuffer()],
    PROGRAM_ID,
  )
}

// Initialize a new voting system
export async function initializeVotingSystem(
  connection: Connection,
  payer: PublicKey,
  name: string,
  description: string,
  sendTransaction: (transaction: Transaction) => Promise<string>,
) {
  // Find PDA for voting account
  const [votingAccountPubkey, votingAccountBump] = await findVotingAccountPDA(name, payer)

  // Calculate space needed for the account
  const space = 1000 // Adjust based on your data size needs

  // Calculate rent-exempt minimum
  const rentExemptMinimum = await connection.getMinimumBalanceForRentExemption(space)

  // Create instruction to create account
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: votingAccountPubkey,
    lamports: rentExemptMinimum,
    space,
    programId: PROGRAM_ID,
  })

  // Create instruction to initialize voting system
  const initializeIx = new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: votingAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: serializeInstructionData(VotingInstruction.initialize(name, description)),
  })

  // Create transaction
  const transaction = new Transaction().add(createAccountIx, initializeIx)

  // Set recent blockhash
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = payer

  // Send transaction
  const signature = await sendTransaction(transaction)

  // Wait for confirmation
  await connection.confirmTransaction(signature)

  return { votingAccountPubkey, signature }
}

// Add a candidate
export async function addCandidate(
  connection: Connection,
  payer: PublicKey,
  votingAccountPubkey: PublicKey,
  name: string,
  description: string,
  sendTransaction: (transaction: Transaction) => Promise<string>,
) {
  // Create instruction to add candidate
  const addCandidateIx = new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: votingAccountPubkey, isSigner: false, isWritable: true },
    ],
    programId: PROGRAM_ID,
    data: serializeInstructionData(VotingInstruction.addCandidate(name, description)),
  })

  // Create transaction
  const transaction = new Transaction().add(addCandidateIx)

  // Set recent blockhash
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = payer

  // Send transaction
  const signature = await sendTransaction(transaction)

  // Wait for confirmation
  await connection.confirmTransaction(signature)

  return { signature }
}

// Cast a vote
export async function castVote(
  connection: Connection,
  payer: PublicKey,
  votingAccountPubkey: PublicKey,
  candidateIndex: number,
  sendTransaction: (transaction: Transaction) => Promise<string>,
) {
  // Find PDA for vote record
  const [voteRecordPubkey, voteRecordBump] = await findVoteRecordPDA(payer, votingAccountPubkey)

  // Calculate space needed for the vote record
  const space = 100 // Adjust based on your data size needs

  // Calculate rent-exempt minimum
  const rentExemptMinimum = await connection.getMinimumBalanceForRentExemption(space)

  // Create instruction to create vote record account
  const createVoteRecordIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: voteRecordPubkey,
    lamports: rentExemptMinimum,
    space,
    programId: PROGRAM_ID,
  })

  // Create instruction to cast vote
  const voteIx = new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: votingAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: voteRecordPubkey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: serializeInstructionData(VotingInstruction.vote(candidateIndex)),
  })

  // Create transaction
  const transaction = new Transaction().add(createVoteRecordIx, voteIx)

  // Set recent blockhash
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = payer

  // Send transaction
  const signature = await sendTransaction(transaction)

  // Wait for confirmation
  await connection.confirmTransaction(signature)

  return { signature }
}

// Set voting period
export async function setVotingPeriod(
  connection: Connection,
  payer: PublicKey,
  votingAccountPubkey: PublicKey,
  startTime: number,
  endTime: number,
  sendTransaction: (transaction: Transaction) => Promise<string>,
) {
  // Create instruction to set voting period
  const setVotingPeriodIx = new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: votingAccountPubkey, isSigner: false, isWritable: true },
    ],
    programId: PROGRAM_ID,
    data: serializeInstructionData(VotingInstruction.setVotingPeriod(startTime, endTime)),
  })

  // Create transaction
  const transaction = new Transaction().add(setVotingPeriodIx)

  // Set recent blockhash
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = payer

  // Send transaction
  const signature = await sendTransaction(transaction)

  // Wait for confirmation
  await connection.confirmTransaction(signature)

  return { signature }
}

// Check if a user has voted
export async function hasUserVoted(
  connection: Connection,
  voterPubkey: PublicKey,
  votingAccountPubkey: PublicKey | null,
) {
  if (!votingAccountPubkey) return false

  try {
    const [voteRecordPubkey] = await findVoteRecordPDA(voterPubkey, votingAccountPubkey)
    const accountInfo = await connection.getAccountInfo(voteRecordPubkey)
    return accountInfo !== null
  } catch (error) {
    console.error("Error checking if user voted:", error)
    return false
  }
}

// Get voting system data
export async function getVotingSystemData(connection: Connection, votingAccountPubkey: PublicKey | null) {
  if (!votingAccountPubkey) {
    return {
      admin: null,
      name: "Demo Voting System",
      description: "This is a demo voting system",
      candidates: [
        { name: "Alice Johnson", description: "Progressive Party candidate", votes: 12 },
        { name: "Bob Smith", description: "Conservative Alliance candidate", votes: 8 },
        { name: "Charlie Davis", description: "Independent candidate", votes: 15 },
        { name: "Diana Miller", description: "Green Future candidate", votes: 5 },
      ],
      startTime: Date.now() / 1000,
      endTime: Date.now() / 1000 + 7 * 24 * 60 * 60, // 1 week from now
      isActive: true,
    }
  }

  try {
    const accountInfo = await connection.getAccountInfo(votingAccountPubkey)
    if (!accountInfo) {
      throw new Error("Voting account not found")
    }

    // In a real app, you would deserialize the account data
    // For now, return mock data
    return {
      admin: new PublicKey("11111111111111111111111111111111"),
      name: "Demo Voting System",
      description: "This is a demo voting system",
      candidates: [
        { name: "Alice Johnson", description: "Progressive Party candidate", votes: 12 },
        { name: "Bob Smith", description: "Conservative Alliance candidate", votes: 8 },
        { name: "Charlie Davis", description: "Independent candidate", votes: 15 },
        { name: "Diana Miller", description: "Green Future candidate", votes: 5 },
      ],
      startTime: Date.now() / 1000,
      endTime: Date.now() / 1000 + 7 * 24 * 60 * 60, // 1 week from now
      isActive: true,
    }
  } catch (error) {
    console.error("Error getting voting system data:", error)
    // Return mock data in case of error
    return {
      admin: null,
      name: "Demo Voting System",
      description: "This is a demo voting system",
      candidates: [
        { name: "Alice Johnson", description: "Progressive Party candidate", votes: 12 },
        { name: "Bob Smith", description: "Conservative Alliance candidate", votes: 8 },
        { name: "Charlie Davis", description: "Independent candidate", votes: 15 },
        { name: "Diana Miller", description: "Green Future candidate", votes: 5 },
      ],
      startTime: Date.now() / 1000,
      endTime: Date.now() / 1000 + 7 * 24 * 60 * 60, // 1 week from now
      isActive: true,
    }
  }
}

