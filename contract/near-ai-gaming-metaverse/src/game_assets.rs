// This module implements the Game Asset (NFT) Module for the AI gaming metaverse on the NEAR blockchain.

use near_sdk::{env, AccountId, BorshStorageKey};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, LookupMap};
use serde::{Serialize, Deserialize};
use schemars::JsonSchema;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, JsonSchema, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Asset {
    pub id: u64,
    pub world_id: u64,
    pub name: String,
    pub asset_uri: String,
    pub owner: AccountId,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct GameAssets {
    pub assets: UnorderedMap<u64, Asset>,
    pub owner_assets: LookupMap<AccountId, Vec<u64>>,
    pub next_asset_id: u64,
}

impl Default for GameAssets {
    fn default() -> Self {
        Self {
            assets: UnorderedMap::new(b"a".to_vec()),
            owner_assets: LookupMap::new(b"o".to_vec()),
            next_asset_id: 0,
        }
    }
}

impl GameAssets {
    // Mints an asset (NFT) linked to a world and IPFS URI.
    pub fn mint_asset(&mut self, world_id: u64, name: String, asset_uri: String) -> u64 {
        let owner = env::signer_account_id();
        let asset_id = self.next_asset_id;
        let asset = Asset {
            id: asset_id,
            world_id,
            name,
            asset_uri,
            owner: owner.clone(),
        };

        self.assets.insert(&asset_id, &asset);
        let mut owner_assets = self.owner_assets.get(&owner).unwrap_or_else(Vec::new);
        owner_assets.push(asset_id);
        self.owner_assets.insert(&owner, &owner_assets);
        self.next_asset_id += 1;

        asset_id
    }

    // Lists assets owned by a specific wallet.
    pub fn get_assets_by_owner(&self, account_id: AccountId) -> Vec<Asset> {
        self.owner_assets.get(&account_id)
            .map_or_else(Vec::new, |asset_ids| {
                asset_ids.iter()
                    .filter_map(|id| self.assets.get(id))
                    .collect()
            })
    }

    // Transfers ownership of an asset.
    pub fn transfer_asset(&mut self, asset_id: u64, new_owner: AccountId) {
        let mut asset = self.assets.get(&asset_id).expect("Asset not found");
        let current_owner = env::signer_account_id();

        assert_eq!(asset.owner, current_owner, "Only the owner can transfer the asset");

        // Update ownership
        asset.owner = new_owner.clone();
        self.assets.insert(&asset_id, &asset);

        // Add asset to new owner's list
        let mut new_owner_assets = self.owner_assets.get(&new_owner).unwrap_or_else(Vec::new);
        new_owner_assets.push(asset_id);
        self.owner_assets.insert(&new_owner, &new_owner_assets);

        // Remove asset from the current owner's list
        let mut current_owner_assets = self.owner_assets.get(&current_owner).unwrap_or_else(Vec::new);
        current_owner_assets.retain(|&id| id != asset_id);
        self.owner_assets.insert(&current_owner, &current_owner_assets);
    }
}