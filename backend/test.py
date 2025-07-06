import requests

creater_id = "user123"  # Example creator ID

response = requests.post("http://localhost:8000/generate-world", json={
    "prompt": "A mystical forest with ancient ruins",
    "size": "large",
    "theme": "fantasy",
    "creator_id": creater_id})

print("Status Code:", response.status_code)
if response.status_code == 200:
    data = response.json()
    print("World ID:", data.get("world_id"))
    print("Description:", data.get("description"))
    print("Metadata URI:", data.get("metadata_uri"))
    print("Preview Hash:", data.get("preview_hash"))
    print("Estimated Assets:", data.get("estimated_assets"))
    print("Cost:", data.get("cost"))
else:
    print("Error:", response.json().get("detail", "Unknown error"))

responses = requests.post("http://localhost:8000/mint-world", json={
    "world_id": data.get("world_id"),
    "creator_id": creater_id,
    "metadata_uri": data.get("metadata_uri"),
    "preview_hash": data.get("preview_hash")}
)

print("Status Code:", responses.status_code)
if responses.status_code == 200:
    data = responses.json()
    print("Minted World ID:", data.get("world_id"))
    print("Transaction Hash:", data.get("transaction_hash"))
else:
    print("Error:", responses.json().get("detail", "Unknown error"))