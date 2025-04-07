use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};

// Define the program's entrypoint
entrypoint!(process_instruction);

// Program instructions
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VotingInstruction {
    // Initialize a new voting system
    Initialize {
        name: String,
        description: String,
    },
    // Add a new candidate
    AddCandidate {
        name: String,
        description: String,
    },
    // Cast a vote for a candidate
    Vote {
        candidate_index: u32,
    },
    // Set voting period
    SetVotingPeriod {
        start_time: i64,
        end_time: i64,
    },
}

// Voting system state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct VotingSystem {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub candidates: Vec<Candidate>,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
}

// Candidate structure
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Candidate {
    pub name: String,
    pub description: String,
    pub votes: u64,
}

// Vote record to track who has voted
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub candidate_index: u32,
    pub timestamp: i64,
}

// Process program instructions
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction data
    let instruction = VotingInstruction::try_from_slice(instruction_data)?;
    
    match instruction {
        VotingInstruction::Initialize { name, description } => {
            initialize_voting_system(program_id, accounts, name, description)
        }
        VotingInstruction::AddCandidate { name, description } => {
            add_candidate(program_id, accounts, name, description)
        }
        VotingInstruction::Vote { candidate_index } => {
            vote(program_id, accounts, candidate_index)
        }
        VotingInstruction::SetVotingPeriod { start_time, end_time } => {
            set_voting_period(program_id, accounts, start_time, end_time)
        }
    }
}

// Initialize a new voting system
fn initialize_voting_system(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    description: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let initializer = next_account_info(accounts_iter)?;
    let voting_account = next_account_info(accounts_iter)?;
    let rent_info = next_account_info(accounts_iter)?;
    
    // Verify initializer signed the transaction
    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Verify program owns the voting account
    if voting_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Get rent sysvar
    let rent = &Rent::from_account_info(rent_info)?;
    
    // Ensure account is rent-exempt
    if !rent.is_exempt(voting_account.lamports(), voting_account.data_len()) {
        return Err(ProgramError::AccountNotRentExempt);
    }
    
    // Create voting system state
    let voting_system = VotingSystem {
        admin: *initializer.key,
        name,
        description,
        candidates: Vec::new(),
        start_time: 0,
        end_time: 0,
        is_active: false,
    };
    
    // Serialize and store voting system state
    voting_system.serialize(&mut *voting_account.data.borrow_mut())?;
    
    msg!("Voting system initialized");
    Ok(())
}

// Add a new candidate
fn add_candidate(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    description: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let admin = next_account_info(accounts_iter)?;
    let voting_account = next_account_info(accounts_iter)?;
    
    // Verify admin signed the transaction
    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Verify program owns the voting account
    if voting_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize voting system state
    let mut voting_system = VotingSystem::try_from_slice(&voting_account.data.borrow())?;
    
    // Verify admin is authorized
    if voting_system.admin != *admin.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Create new candidate
    let candidate = Candidate {
        name,
        description,
        votes: 0,
    };
    
    // Add candidate to voting system
    voting_system.candidates.push(candidate);
    
    // Serialize and store updated voting system state
    voting_system.serialize(&mut *voting_account.data.borrow_mut())?;
    
    msg!("Candidate added");
    Ok(())
}

// Cast a vote
fn vote(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    candidate_index: u32,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let voter = next_account_info(accounts_iter)?;
    let voting_account = next_account_info(accounts_iter)?;
    let vote_record_account = next_account_info(accounts_iter)?;
    let clock_info = next_account_info(accounts_iter)?;
    
    // Verify voter signed the transaction
    if !voter.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Verify program owns the accounts
    if voting_account.owner != program_id || vote_record_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize voting system state
    let mut voting_system = VotingSystem::try_from_slice(&voting_account.data.borrow())?;
    
    // Check if voting is active
    if !voting_system.is_active {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Get current time
    let clock = solana_program::clock::Clock::from_account_info(clock_info)?;
    let current_time = clock.unix_timestamp;
    
    // Check if voting period is valid
    if current_time < voting_system.start_time || current_time > voting_system.end_time {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Check if candidate index is valid
    if candidate_index as usize >= voting_system.candidates.len() {
        return Err(ProgramError::InvalidArgument);
    }
    
    // Check if voter has already voted
    if !vote_record_account.data_is_empty() {
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    // Increment candidate votes
    voting_system.candidates[candidate_index as usize].votes += 1;
    
    // Create vote record
    let vote_record = VoteRecord {
        voter: *voter.key,
        candidate_index,
        timestamp: current_time,
    };
    
    // Serialize and store vote record
    vote_record.serialize(&mut *vote_record_account.data.borrow_mut())?;
    
    // Serialize and store updated voting system state
    voting_system.serialize(&mut *voting_account.data.borrow_mut())?;
    
    msg!("Vote cast for candidate {}", candidate_index);
    Ok(())
}

// Set voting period
fn set_voting_period(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    start_time: i64,
    end_time: i64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let admin = next_account_info(accounts_iter)?;
    let voting_account = next_account_info(accounts_iter)?;
    
    // Verify admin signed the transaction
    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Verify program owns the voting account
    if voting_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize voting system state
    let mut voting_system = VotingSystem::try_from_slice(&voting_account.data.borrow())?;
    
    // Verify admin is authorized
    if voting_system.admin != *admin.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Validate time period
    if end_time <= start_time {
        return Err(ProgramError::InvalidArgument);
    }
    
    // Update voting period
    voting_system.start_time = start_time;
    voting_system.end_time = end_time;
    voting_system.is_active = true;
    
    // Serialize and store updated voting system state
    voting_system.serialize(&mut *voting_account.data.borrow_mut())?;
    
    msg!("Voting period set");
    Ok(())
}

