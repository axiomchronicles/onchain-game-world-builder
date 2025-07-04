// pages/index.tsx
"use client"

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [world, setWorld] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch("/api/generate-world", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setWorld(data.world || data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🛠 Game World Builder</h1>

      <textarea
        className="w-full p-4 rounded text-black"
        rows={5}
        value={prompt}
        placeholder="Describe your game world..."
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-600 mt-4 px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Generating..." : "Generate World"}
      </button>

      {world && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">🎮 Generated World</h2>
          <pre className="whitespace-pre-wrap break-words text-green-300">
            {typeof world === "string" ? world : JSON.stringify(world, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
