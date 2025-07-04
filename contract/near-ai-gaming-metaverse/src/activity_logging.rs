// This module implements the Activity & Game Log Module.
// It exports functions to log player actions and retrieve action history.

use near_sdk::{env, near_bindgen};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;

#[derive(BorshDeserialize, BorshSerialize, Clone)]
pub struct GameLog {
    pub world_id: u64,
    pub action: String,
    pub timestamp: u64,

#[derive(BorshDeserialize, BorshSerialize, Default)]
pub struct ActivityLogging {
    logs: UnorderedMap<u64, Vec<GameLog>>,
}


impl ActivityLogging {
    pub fn log_action(&mut self, world_id: u64, action: String) {
        let mut logs = self.logs.get(&world_id).unwrap_or_else(|| Vec::new());
        logs.push(GameLog {
            world_id,
            action,
            timestamp: env::block_timestamp(),
        });
        self.logs.insert(&world_id, &logs);
    }

    pub fn get_world_logs(&self, world_id: u64) -> Vec<GameLog> {
        self.logs.get(&world_id).unwrap_or_else(|| Vec::new())
    }
}