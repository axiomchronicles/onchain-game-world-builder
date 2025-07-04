// This file serves as the main entry point for the smart contract. It initializes the contract and includes the necessary modules for world creation, game assets, world editing, user profiles, activity logging, and monetization. It also handles the contract's state and exposes public functions.

use near_sdk::near_bindgen;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

mod world_creation;
pub use crate::world_creation::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, Default)]
pub struct Contract {
    pub world_module: world_creation::WorldModule,
    // Add other modules here as you implement them
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            world_module: world_creation::WorldModule::default(),
            // Initialize other state variables
        }
    }

    // World Creation methods
    pub fn create_world(&mut self, name: String, description: String, ipfs_url: String) -> u64 {
        self.world_module.create_world(name, description, ipfs_url)
    }
    pub fn get_world(&self, id: u64) -> Option<world_creation::GameWorldDTO> {
        self.world_module.get_world(id).as_ref().map(|w| world_creation::GameWorldDTO::from(w))
    }
    pub fn get_all_worlds(&self) -> Vec<world_creation::GameWorldDTO> {
        self.world_module.get_all_worlds().iter().map(|w| world_creation::GameWorldDTO::from(w)).collect()
    }
}