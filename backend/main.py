import os
import uuid
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from near_api.signer import KeyPair
from near_api.providers import JsonProvider
from near_api.transactions import Transaction

app = FastAPI()

# NEAR Configuration
NEAR_NETWORK = "testnet"
NEAR_CONTRACT_ID = os.getenv("NEAR_CONTRACT_ID", "monikaaatestnet.testnet")
NEAR_NODE_URL = f"https://rpc.{NEAR_NETWORK}.near.org"
NEAR_HELPER_URL = f"https://helper.{NEAR_NETWORK}.near.org"
NEAR_WALLET_URL = f"https://wallet.{NEAR_NETWORK}.near.org"

# AI Service Configuration
AI_API_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_API_KEY = "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"

class WorldRequest(BaseModel):
    prompt: str
    size: str = "medium"
    theme: str = "fantasy"
    creator_id: str

class MintRequest(BaseModel):
    world_id: str
    creator_id: str
    metadata_uri: str
    preview_hash: str

@app.post("/generate-world")
async def generate_world(request: WorldRequest):
    """Generate 3D world using AI"""
    try:
        # Call AI service to generate world description and assets
        ai_response = requests.post(
            AI_API_URL,
            headers={"Authorization": f"Bearer {AI_API_KEY}"},
            json={
                "model": "openai/gpt-4o",
                "messages": [
                    {"role": "system", "content": "You are a 3D game world builder. Generate detailed world description and asset list."},
                    {"role": "user", "content": f"Create a {request.theme} world: {request.prompt}"}
                ],
                "max_tokens": 500
            }
        )
        
        if ai_response.status_code != 200:
            print("AI service error:", ai_response.text)
            raise HTTPException(status_code=500, detail="AI service error")
        
        ai_data = ai_response.json()
        world_description = ai_data["choices"][0]["message"]["content"]
        
        # Generate unique world ID
        world_id = str(uuid.uuid4())
        
        # In a real implementation, this would generate actual 3D assets
        # and upload to IPFS/Arweave
        metadata_uri = f"https://ipfs.io/ipfs/{world_id}/metadata.json"
        preview_hash = f"Qm{world_id.replace('-', '')}"
        
        return {
            "world_id": world_id,
            "description": world_description,
            "metadata_uri": metadata_uri,
            "preview_hash": preview_hash,
            "estimated_assets": 1240,
            "cost": 50
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mint-world")
async def mint_world(request: MintRequest):
    """Mint world as NFT on NEAR blockchain"""
    try:
        # Get creator account info
        print(request)
        account_info = requests.get(
            f"{NEAR_HELPER_URL}/account/{request.creator_id}"
        ).json()
        
        if 'error' in account_info:
            raise HTTPException(status_code=400, detail="Invalid creator account")
        
        # Prepare mint transaction
        key_pair = KeyPair(account_info['public_key'])
        provider = JsonProvider(NEAR_NODE_URL)
        
        transaction = Transaction(
            signer_id=request.creator_id,
            receiver_id=NEAR_CONTRACT_ID,
            nonce=account_info['nonce'] + 1,
            actions=[
                {
                    "type": "FunctionCall",
                    "method_name": "mint_world",
                    "args": {
                        "world_id": request.world_id,
                        "owner_id": request.creator_id,
                        "metadata_uri": request.metadata_uri,
                        "preview_hash": request.preview_hash
                    },
                    "gas": 30000000000000,
                    "deposit": "10000000000000000000000"  # 0.01 NEAR
                }
            ],
            block_hash=provider.get_status()['sync_info']['latest_block_hash']
        )
        
        # Sign and send transaction
        signed_tx = transaction.sign(key_pair)
        result = provider.send_tx_and_wait(signed_tx, timeout=30)
        
        return {
            "transaction_id": result['transaction']['hash'],
            "explorer_url": f"{NEAR_WALLET_URL}/transactions/{result['transaction']['hash']}",
            "world_id": request.world_id
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/world/{world_id}")
async def get_world(world_id: str):
    """Get world metadata"""
    # This would query the NEAR contract in a real implementation
    return {
        "world_id": world_id,
        "owner": "creator.near",
        "created_at": "2023-07-15T10:30:00Z",
        "metadata_uri": f"https://ipfs.io/ipfs/{world_id}/metadata.json",
        "preview_url": f"https://ipfs.io/ipfs/Qm{world_id.replace('-', '')}",
        "transactions": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)