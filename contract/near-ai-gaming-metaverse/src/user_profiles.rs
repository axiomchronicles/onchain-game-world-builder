// This module implements the User Profile Module for the AI gaming metaverse.
// It provides functionalities for user registration and profile retrieval.

use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise};
use std::collections::HashMap;

#[near_bindgen]
#[derive(Default, PanicOnDefault)]
pub struct UserProfile {
    users: HashMap<AccountId, UserData>,
}

#[derive(Clone, Debug)]
pub struct UserData {
    username: String,
    worlds_created: Vec<u64>,
    assets_owned: Vec<u64>,
}

#[near_bindgen]
impl UserProfile {
    // Registers a new user with a unique username.
    pub fn register_user(&mut self, username: String) {
        let account_id = env::signer_account_id();
        assert!(!self.users.contains_key(&account_id), "User already registered.");

        self.users.insert(account_id.clone(), UserData {
            username,
            worlds_created: Vec::new(),
            assets_owned: Vec::new(),
        });
    }

    // Retrieves the user profile data for a given account ID.
    pub fn get_user_profile(&self, account_id: AccountId) -> Option<UserData> {
        self.users.get(&account_id).cloned()
    }

    // Additional helper functions can be added here, such as updating user profiles or managing worlds and assets.
}