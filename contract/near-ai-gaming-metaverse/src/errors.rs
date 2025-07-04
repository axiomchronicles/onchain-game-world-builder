// This file defines custom error types for the smart contract, helping to handle errors gracefully throughout the contract's functions.

use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("Unauthorized access")]
    Unauthorized,
    
    #[error("World not found")]
    WorldNotFound,
    
    #[error("Asset not found")]
    AssetNotFound,
    
    #[error("User not found")]
    UserNotFound,
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Insufficient funds")]
    InsufficientFunds,
    
    #[error("Action not allowed")]
    ActionNotAllowed,
}