// This module contains the implementation of the World Creation Module.
use schemars::JsonSchema;
use near_sdk::{near_bindgen, env, AccountId, BorshStorageKey};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use serde::{Serialize, Deserialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct GameWorld {
    pub id: u64,
    pub owner_id: AccountId,
    pub name: String,
    pub description: String,
    pub ipfs_url: String,
    pub timestamp: u64,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct WorldModule {
    pub worlds: UnorderedMap<u64, GameWorld>,
    pub next_world_id: u64,
}

impl Default for WorldModule {
    fn default() -> Self {
        Self {
            worlds: UnorderedMap::new(b"w".to_vec()),
            next_world_id: 0,
        }
    }
}


impl WorldModule {
    // Stores world metadata including name, description, and AI-generated asset link.
    pub fn create_world(&mut self, name: String, description: String, ipfs_url: String) -> u64 {
        let world_id = self.next_world_id;
        let world = GameWorld {
            id: world_id,
            owner_id: env::signer_account_id(),
            name,
            description,
            ipfs_url,
            timestamp: env::block_timestamp(),
        };
        self.worlds.insert(&world_id, &world);
        self.next_world_id += 1;
        world_id
    }

    // Returns a specific world by ID.
    pub fn get_world(&self, id: u64) -> Option<GameWorld> {
        self.worlds.get(&id)
    }

    // Returns a list of all worlds created.
    pub fn get_all_worlds(&self) -> Vec<GameWorld> {
        self.worlds.values_as_vector().to_vec()
    }
}

#[derive(Serialize, Deserialize, JsonSchema, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct GameWorldDTO {
    pub id: u64,
    pub owner_id: String,
    pub name: String,
    pub description: String,
    pub ipfs_url: String,
    pub timestamp: u64,
}

// Conversion from GameWorld to GameWorldDTO
impl From<&GameWorld> for GameWorldDTO {
    fn from(world: &GameWorld) -> Self {
        Self {
            id: world.id,
            owner_id: world.owner_id.to_string(),
            name: world.name.clone(),
            description: world.description.clone(),
            ipfs_url: world.ipfs_url.clone(),
            timestamp: world.timestamp,
        }
    }
}