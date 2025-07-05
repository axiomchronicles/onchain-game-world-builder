// pages/index.js
"use client";
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Head from 'next/head';
import { motion } from 'framer-motion';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function GameWorldBuilder() {
  const [prompt, setPrompt] = useState('');
  const [worldData, setWorldData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const particlesRef = useRef(null);

  // Sample world templates for inspiration
  const worldTemplates = [
    "A neon cyberpunk world where time flows backward every hour, and flying whales guard the sky.",
    "A mystical forest kingdom with sentient trees and glowing mushrooms that grant special abilities.",
    "An underwater metropolis with bubble transportation systems and bio-luminescent architecture.",
    "A floating steampunk city with clockwork automatons and airship docks.",
    "A post-apocalyptic wasteland where robotic dinosaurs roam and survivors trade in ancient tech."
  ];

  useEffect(() => {
    // GSAP Animations
    gsap.fromTo(sectionRef.current, 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%'
        }
      }
    );

    // Create particle background
    createParticles();

    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.walletConnection && window.walletConnection.isSignedIn()) {
      setWalletConnected(true);
      setWalletAddress(window.accountId);
    }
  }, []);

  const createParticles = () => {
    if (!particlesRef.current) return;
    
    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 150;
    const colors = ['#8A2BE2', '#00CED1', '#7B68EE', '#48D1CC', '#9370DB'];
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.1;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
        
        // Draw connections between particles
        particles.forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = 0.05 * (1 - distance/100);
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  };

  const createWorld = async () => {
    if (!walletConnected) {
      alert('Please connect your NEAR wallet first!');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Simulate AI generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Interact with NEAR Smart Contract
      // In a real app: await window.contract.create_world({ world_description: prompt, creator: window.accountId });
      
      // Generate attributes based on prompt
      const themes = ['cyberpunk', 'fantasy', 'steampunk', 'post-apocalyptic', 'underwater'];
      const creatures = ['whales', 'dragons', 'robots', 'dinosaurs', 'spirits'];
      const specialFeatures = ['time reversal', 'gravity shifts', 'elemental magic', 'tech augmentation', 'bio-luminescence'];
      
      const generatedWorld = {
        id: Math.floor(Math.random() * 10000),
        title: `${prompt.split(' ')[0]} ${prompt.split(' ')[1]} Realm`,
        description: prompt,
        creator: walletAddress,
        createdAt: new Date().toISOString(),
        attributes: {
          theme: themes[Math.floor(Math.random() * themes.length)],
          era: Math.floor(Math.random() * 1000) + ' AE',
          creatures: [creatures[Math.floor(Math.random() * creatures.length)]], 
          specialFeature: specialFeatures[Math.floor(Math.random() * specialFeatures.length)],
          rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 5)],
          size: `${Math.floor(Math.random() * 1000) + 500} km²`
        },
        stats: {
          players: Math.floor(Math.random() * 1000),
          value: (Math.random() * 10).toFixed(2) + ' Ⓝ',
          created: `${Math.floor(Math.random() * 30) + 1} days ago`
        }
      };
      
      setWorldData(generatedWorld);
      
      // Animate world creation
      gsap.fromTo('.world-card', 
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: 'elastic.out(1, 0.8)' }
      );
      
    } catch (error) {
      console.error('World creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // NEAR Wallet Connection
  const connectWallet = async () => {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWalletConnected(true);
      setWalletAddress('neardevuser.near');
      
      // In a real app:
      // await window.nearWallet.requestSignIn({
      //   contractId: 'monikaaatestnet.testnet',
      //   methodNames: ['create_world', 'get_worlds']
      // });
      
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const getRandomTemplate = () => {
    const randomTemplate = worldTemplates[Math.floor(Math.random() * worldTemplates.length)];
    setPrompt(randomTemplate);
  };

  return (
    <>
      <Head>
        <title>Neon Nexus - AI Web3 World Builder</title>
        <meta name="description" content="Create blockchain-powered game worlds with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Particle Background */}
      <canvas 
        ref={particlesRef} 
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 opacity-95 z-0" />
        
        <div className="container mx-auto px-4 py-32 flex flex-col items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 font-orbitron tracking-wide">
              NEON NEXUS
            </h1>
            <p className="text-xl mb-4 text-cyan-200 max-w-2xl">
              AI-Powered Blockchain Game World Builder
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-purple-900/50 rounded-full text-xs text-purple-300">
                Powered by NEAR
              </span>
              <span className="px-3 py-1 bg-cyan-900/50 rounded-full text-xs text-cyan-300">
                Smart Contract: monikaaatestnet.testnet
              </span>
            </div>
          </motion.div>
          
          <div 
            ref={sectionRef}
            className="w-full max-w-3xl bg-gray-800/30 backdrop-blur-lg rounded-xl border border-cyan-500/30 p-8 shadow-2xl shadow-purple-500/20 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
            
            <h2 className="text-2xl font-bold mb-6 text-cyan-300 flex items-center gap-2">
              <span className="material-icons text-cyan-400">auto_awesome</span>
              Describe Your Game World
            </h2>
            
            <div className="relative mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon cyberpunk world where time flows backward every hour, and flying whales guard the sky."
                className="w-full px-6 py-4 bg-gray-900/80 border border-cyan-500/30 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none min-h-[120px]"
                rows={3}
              />
              <div className="flex justify-between mt-2">
                <button 
                  onClick={getRandomTemplate}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span className="material-icons text-sm">shuffle</span>
                  Get inspiration
                </button>
                <span className="text-xs text-purple-400">
                  {prompt.length}/200 characters
                </span>
              </div>
              
              <button 
                onClick={createWorld}
                disabled={isCreating || !prompt}
                className={`absolute right-2 bottom-2 px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isCreating || !prompt 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 hover:shadow-lg hover:shadow-cyan-500/30'
                }`}
              >
                {isCreating ? (
                  <>
                    <span className="material-icons animate-spin">autorenew</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-icons">bolt</span>
                    Generate World
                  </>
                )}
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  onClick={connectWallet}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    walletConnected 
                      ? 'bg-green-600/30 text-green-300 cursor-default'
                      : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  <span className="material-icons">account_balance_wallet</span>
                  {walletConnected ? 'Wallet Connected' : 'Connect NEAR Wallet'}
                </button>
                
                {walletConnected && (
                  <div className="text-xs bg-gray-800/50 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-icons text-sm text-cyan-400">check_circle</span>
                    {walletAddress.substring(0, 12)}...{walletAddress.substring(walletAddress.length - 4)}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200"
              >
                <span className="material-icons text-sm">help</span>
                {showTutorial ? 'Hide tips' : 'Show tips'}
              </button>
            </div>
            
            {showTutorial && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 bg-gray-900/50 p-4 rounded-lg border border-purple-500/30"
              >
                <h3 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="material-icons text-sm">lightbulb</span>
                  Creation Tips
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Include unique features like "time reversal" or "floating islands"</li>
                  <li>• Describe creatures, architecture, and special rules</li>
                  <li>• Add environmental details for richer worlds</li>
                  <li>• Worlds are stored on the NEAR blockchain permanently</li>
                </ul>
              </motion.div>
            )}
          </div>
          
          {/* Featured Worlds Carousel */}
          <div className="mt-16 w-full max-w-5xl">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">Recently Created Worlds</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {worldTemplates.slice(0, 3).map((world, index) => (
                <div key={index} className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20 hover:border-cyan-500/40 transition-all">
                  <div className="h-32 mb-3 rounded-lg bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center">
                    <span className="material-icons text-4xl text-purple-400">public</span>
                  </div>
                  <h4 className="font-bold text-cyan-200 mb-1">{world.split(' ').slice(0, 3).join(' ')}...</h4>
                  <p className="text-xs text-gray-300 line-clamp-2">{world}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs px-2 py-1 bg-cyan-900/30 rounded text-cyan-300">Epic</span>
                    <span className="text-xs text-gray-400">5.2k players</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* World Display Section */}
      {worldData && (
        <section className="py-20 bg-gradient-to-b from-indigo-900/10 to-gray-900 relative">
          <div className="absolute inset-0 bg-grid-white/5 z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-cyan-300">
                Your AI-Generated World
              </h2>
              <p className="text-purple-300 max-w-2xl mx-auto">
                This unique game world has been deployed to the NEAR blockchain and is ready for exploration
              </p>
            </div>
            
            <div 
              ref={cardRef}
              className="world-card mx-auto max-w-4xl bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-cyan-500/30 shadow-xl shadow-purple-500/10 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10 z-0" />
              <div className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-cyan-200">{worldData.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-cyan-900/50 rounded-full text-xs text-cyan-300 flex items-center gap-1">
                        <span className="material-icons text-sm">public</span>
                        Blockchain: NEAR
                      </span>
                      <span className="px-3 py-1 bg-purple-900/50 rounded-full text-xs text-purple-300 flex items-center gap-1">
                        <span className="material-icons text-sm">star</span>
                        Rarity: {worldData.attributes.rarity}
                      </span>
                      <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 flex items-center gap-1">
                        <span className="material-icons text-sm">schedule</span>
                        Created: {worldData.stats.created}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 px-4 py-2 rounded-lg hover:opacity-90">
                      <span className="material-icons">share</span>
                      Share
                    </button>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-2 rounded-lg hover:bg-gray-600 border border-gray-600">
                      <span className="material-icons">favorite_border</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-xl mb-8 border border-gray-700">
                  <p className="text-lg text-indigo-100">{worldData.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-lg font-bold mb-4 text-cyan-300 flex items-center gap-2">
                      <span className="material-icons">tune</span>
                      World Attributes
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(worldData.attributes).map(([key, value]) => (
                        <div key={key} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                          <div className="text-sm text-cyan-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          <div className="text-lg font-medium text-white mt-1">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold mb-4 text-cyan-300 flex items-center gap-2">
                      <span className="material-icons">insights</span>
                      World Stats
                    </h4>
                    <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 h-full">
                      <div className="space-y-4">
                        {Object.entries(worldData.stats).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center pb-3 border-b border-gray-700 last:border-0">
                            <div className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="text-lg font-medium text-cyan-300">{value}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 p-4 rounded-lg border border-cyan-500/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-cyan-300">World Value</div>
                            <div className="text-xl font-bold text-white">{worldData.stats.value}</div>
                          </div>
                          <button className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2 rounded-lg text-sm">
                            <span className="material-icons">paid</span>
                            Trade Assets
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-700 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center">
                      <span className="material-icons text-sm">person</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Creator</div>
                      <div className="text-cyan-300">{worldData.creator || 'You'}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:bg-gray-600 border border-gray-600">
                      <span className="material-icons">edit</span>
                      Customize
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg hover:opacity-90">
                      <span className="material-icons">sports_esports</span>
                      Enter World
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Build the Future of Gaming
            </h2>
            <p className="text-purple-300 max-w-2xl mx-auto">
              Create, own, and monetize immersive game worlds powered by AI and blockchain technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: 'diamond',
                title: 'True Digital Ownership',
                desc: 'Your creations are stored as NFTs on the NEAR blockchain, giving you complete ownership and control.'
              },
              {
                icon: 'bolt',
                title: 'AI-Powered Creation',
                desc: 'Generate rich, detailed worlds with simple text prompts using advanced generative AI.'
              },
              {
                icon: 'paid',
                title: 'Monetize Your Worlds',
                desc: 'Earn cryptocurrency when players explore your worlds or purchase in-world assets.'
              },
              {
                icon: 'groups',
                title: 'Multiplayer Ready',
                desc: 'Instantly deploy multiplayer environments with built-in social features.'
              },
              {
                icon: 'auto_awesome',
                title: 'Dynamic Worlds',
                desc: 'Create worlds that evolve over time based on player interactions and in-game events.'
              },
              {
                icon: 'extension',
                title: 'Extend with Plugins',
                desc: 'Enhance your world with plugins for quests, economies, and custom mechanics.'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)' }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
              >
                <div className="text-cyan-400 mb-4">
                  <span className="material-icons text-4xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                NEON NEXUS
              </div>
              <p className="text-gray-400 text-sm">
                AI-Powered Web3 Game World Builder
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">
                Powered by NEAR Protocol
              </div>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
                  <span className="material-icons text-purple-400">discord</span>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
                  <span className="material-icons text-cyan-400">telegram</span>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
                  <span className="material-icons text-blue-400">twitter</span>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <div>Smart Contract:</div>
              <div className="font-mono text-cyan-300">monikaaatestnet.testnet</div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Neon Nexus. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}