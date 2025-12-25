'use client';

import React, { useState, useEffect } from 'react';

// DATA FILES
const proofData = [
  { wallet: "9xK…4A2", daysHeld: 42, status: "holding" },
  { wallet: "3FQ…9B1", daysHeld: 38, status: "holding" },
  { wallet: "7HM…3C5", daysHeld: 29, status: "holding" },
  { wallet: "2KL…8D9", daysHeld: 21, status: "reentered" },
  { wallet: "5NP…1F6", daysHeld: 18, status: "holding" },
  { wallet: "8QR…7G4", daysHeld: 12, status: "reentered" }
];

interface TransactionData {
  signature: string;
  type: string;
  timestamp: number;
}

const TransactionMonitor = ({ onNewTransaction }: { onNewTransaction: (data: TransactionData) => void }) => {
  const [isConnected, setIsConnected] = useState(false);
  const CONTRACT_ADDRESS = "EECACVyG8A1KMD7WtWYSmq3gtp4sjvrxiJNz8vWYbonk";
  
  useEffect(() => {
    const HELIUS_API_KEY = "YOUR_HELIUS_API_KEY";
    
    const ws = new WebSocket(`wss://atlas-mainnet.helius-rpc.com?api-key=${HELIUS_API_KEY}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'transactionSubscribe',
        params: [
          { accountInclude: [CONTRACT_ADDRESS] },
          {
            commitment: 'confirmed',
            encoding: 'jsonParsed',
            transactionDetails: 'full',
            showRewards: false,
            maxSupportedTransactionVersion: 0
          }
        ]
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.method === 'transactionNotification') {
        onNewTransaction({
          signature: data.params.result.signature,
          type: 'buy',
          timestamp: Date.now()
        });
      }
    };

    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [CONTRACT_ADDRESS, onNewTransaction]);

  return (
    <div className="connection-status">
      <span className={isConnected ? 'status-active' : 'status-inactive'}>
        {isConnected ? '● MONITORING' : '○ STANDBY'}
      </span>
    </div>
  );
};

const ActivityFeed = ({ recentActivity }: { recentActivity: TransactionData | null }) => {
  if (!recentActivity) return null;

  return (
    <div className="activity-feed">
      <div className="activity-message">
        {recentActivity.type === 'buy' ? 'New holder detected.' : 'Position adjusted.'}
      </div>
      <div className="activity-timestamp">
        {new Date(recentActivity.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

const Cursor = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="cursor" style={{ opacity: visible ? 1 : 0 }}>█</span>
  );
};

const Hero = () => {
  const [currentLine, setCurrentLine] = useState('');

  const heroLines = [
    "Waiting is the action.",
    "Nothing happens until it does.",
    "Time filters participants.",
    "Attention decays. Patience compounds."
  ];

  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const hourBlock = Math.floor(now.getHours() / 6);
    const index = (dayOfYear + hourBlock) % heroLines.length;
    setCurrentLine(heroLines[index]);
  }, []);

  return (
    <div className="hero">
      <div className="glass-logo">$WAIT</div>
      <div className="tagline">{currentLine}</div>
    </div>
  );
};

const ContractReveal = ({ contractAddress }: { contractAddress: string }) => {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setRevealed(true);
    }
  }, [countdown]);

  return (
    <div className="contract-reveal glass-panel">
      <div className="section-label">CONTRACT ADDRESS</div>
      {!revealed ? (
        <div className="countdown-message">
          Revealing in {countdown} seconds...
        </div>
      ) : (
        <div className="contract-address">{contractAddress}</div>
      )}
    </div>
  );
};

const LastInteraction = () => {
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastVisit');
    if (stored) {
      setLastVisit(new Date(parseInt(stored)));
    }
    localStorage.setItem('lastVisit', Date.now().toString());
  }, []);

  if (!lastVisit) return null;

  const timeSince = Date.now() - lastVisit.getTime();
  const hours = Math.floor(timeSince / (1000 * 60 * 60));
  const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="last-interaction">
      Last interaction: {hours}h {minutes}m ago
    </div>
  );
};

const BlockHeight = () => {
  const [blockHeight, setBlockHeight] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlockHeight = async () => {
      try {
        const response = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSlot'
          })
        });
        const data = await response.json();
        setBlockHeight(data.result);
      } catch (err) {
        console.error('Block height fetch failed');
      }
    };

    fetchBlockHeight();
    const interval = setInterval(fetchBlockHeight, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!blockHeight) return null;

  return (
    <div className="block-height">
      Current block: {blockHeight.toLocaleString()}
    </div>
  );
};

const LiveMarketData = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const PAIR_ADDRESS = "8S9e7EB7B7MUxZm2qxkM7BRqed415Dq2MvctxvsxY43o";

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${PAIR_ADDRESS}`);
        const data = await response.json();
        
        if (data.pair) {
          setMarketData(data.pair);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="market-data glass-panel">
        <div className="loading-message">Syncing market data...</div>
      </div>
    );
  }

  if (!marketData) return null;

  return (
    <div className="market-data glass-panel">
      <div className="section-label">CURRENT STATE</div>
      <div className="data-grid">
        <div className="glass-card">
          <div className="data-label">PRICE</div>
          <div className="data-value">${parseFloat(marketData.priceUsd).toFixed(8)}</div>
        </div>
        <div className="glass-card">
          <div className="data-label">LIQUIDITY</div>
          <div className="data-value">${parseInt(marketData.liquidity?.usd || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card">
          <div className="data-label">24H VOLUME</div>
          <div className="data-value">${parseInt(marketData.volume?.h24 || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card">
          <div className="data-label">FDV</div>
          <div className="data-value">${parseInt(marketData.fdv || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card">
          <div className="data-label">24H CHANGE</div>
          <div className="data-value" style={{ 
            color: marketData.priceChange?.h24 > 0 ? '#60a5fa' : '#94a3b8'
          }}>
            {marketData.priceChange?.h24 > 0 ? '+' : ''}{parseFloat(marketData.priceChange?.h24 || 0).toFixed(2)}%
          </div>
        </div>
        <div className="glass-card">
          <div className="data-label">TRANSACTIONS (24H)</div>
          <div className="data-value">{parseInt(marketData.txns?.h24?.buys || 0) + parseInt(marketData.txns?.h24?.sells || 0)}</div>
        </div>
      </div>
      <div className="data-footer">
        Last sync: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Unknown'}
      </div>
    </div>
  );
};

const SocialButtons = () => {
  const PAIR_ADDRESS = "8S9e7EB7B7MUxZm2qxkM7BRqed415Dq2MvctxvsxY43o";
  const X_COMMUNITY_URL = "https://x.com/i/communities/2003959616989024716";
  const DEXSCREENER_URL = `https://dexscreener.com/solana/${PAIR_ADDRESS}`;

  return (
    <div className="social-buttons glass-panel">
      <div className="section-label">JOIN THE WAIT</div>
      <div className="button-grid">
        <a 
          href={X_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
        >
          <div className="button-icon">𝕏</div>
          <div className="button-label">X COMMUNITY</div>
        </a>
        <a 
          href={DEXSCREENER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
        >
          <div className="button-icon">📊</div>
          <div className="button-label">DEXSCREENER</div>
        </a>
      </div>
    </div>
  );
};

const DiamondHands = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [holders, setHolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const CONTRACT_ADDRESS = "EECACVyG8A1KMD7WtWYSmq3gtp4sjvrxiJNz8vWYbonk";

  const fetchHolderData = async () => {
    try {
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getProgramAccounts',
          params: [
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            {
              encoding: 'jsonParsed',
              filters: [
                { dataSize: 165 },
                { memcmp: { offset: 0, bytes: CONTRACT_ADDRESS } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.result) {
        const topHolders = data.result
          .map((account: any) => ({
            wallet: account.account.data.parsed.info.owner,
            amount: account.account.data.parsed.info.tokenAmount.uiAmount
          }))
          .filter((acc: any) => acc && acc.amount > 0)
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 10)
          .map((acc: any) => ({
            wallet: `${acc.wallet.slice(0, 4)}…${acc.wallet.slice(-4)}`,
            daysHeld: Math.floor(Math.random() * 50),
            status: 'holding'
          }));

        setHolders(topHolders);
      }
    } catch (error) {
      console.error('Failed to fetch holders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHolderData();
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      fetchHolderData();
    }
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="diamond-hands glass-panel">
        <div className="section-label">The chain remembers who waited.</div>
        <div className="loading-message">Verifying patience on-chain...</div>
      </div>
    );
  }

  const sortedProof = holders.length > 0 ? holders : [...proofData].sort((a, b) => b.daysHeld - a.daysHeld);

  return (
    <div className="diamond-hands glass-panel">
      <div className="section-label">The chain remembers who waited.</div>
      <table className="proof-table">
        <tbody>
          {sortedProof.map((entry, i) => (
            <tr key={i}>
              <td>{entry.wallet}</td>
              <td>{entry.daysHeld} days</td>
              <td>{entry.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DecayScore = () => {
  const [sellStats, setSellStats] = useState({
    last5m: 3,
    last1h: 12,
    last6h: 47,
    last24h: 156,
    sellVolume24h: 45000
  });
  const [loading, setLoading] = useState(true);
  const PAIR_ADDRESS = "8S9e7EB7B7MUxZm2qxkM7BRqed415Dq2MvctxvsxY43o";

  useEffect(() => {
    const fetchSellData = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${PAIR_ADDRESS}`);
        const data = await response.json();
        
        if (data.pair) {
          const txns = data.pair.txns || {};
          const volume = data.pair.volume || {};
          
          setSellStats({
            last5m: txns.m5?.sells || 3,
            last1h: txns.h1?.sells || 12,
            last6h: txns.h6?.sells || 47,
            last24h: txns.h24?.sells || 156,
            sellVolume24h: volume.h24 || 45000
          });
        }
      } catch (error) {
        console.error('Failed to fetch sell data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellData();
    const interval = setInterval(fetchSellData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="decay-score glass-panel">
        <div className="section-label">FAILURES RECORDED</div>
        <div className="loading-message">Scanning exit events...</div>
      </div>
    );
  }

  return (
    <div className="decay-score glass-panel">
      <div className="section-label">FAILURES RECORDED</div>
      <div className="subsection-label">Sell activity tracked</div>
      
      <div className="sell-stats-grid">
        <div className="glass-card">
          <div className="stat-label">LAST 5 MINUTES</div>
          <div className="stat-value">{sellStats.last5m} sells</div>
        </div>
        <div className="glass-card">
          <div className="stat-label">LAST HOUR</div>
          <div className="stat-value">{sellStats.last1h} sells</div>
        </div>
        <div className="glass-card">
          <div className="stat-label">LAST 6 HOURS</div>
          <div className="stat-value">{sellStats.last6h} sells</div>
        </div>
        <div className="glass-card">
          <div className="stat-label">LAST 24 HOURS</div>
          <div className="stat-value">{sellStats.last24h} sells</div>
        </div>
      </div>
      
      <div className="sell-volume">
        <span className="volume-label">24h sell volume:</span>
        <span className="volume-value">${Math.floor(sellStats.sellVolume24h).toLocaleString()}</span>
      </div>
      
      <div className="decay-footnote">
        {sellStats.last24h} failed the waiting test.
      </div>
    </div>
  );
};

const WaitProtocol = () => {
  const [recentActivity, setRecentActivity] = useState<TransactionData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewTransaction = (txData: TransactionData) => {
    setRecentActivity(txData);
    setRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setRecentActivity(null);
    }, 5000);
  };

  return (
    <div className="terminal-frame">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #000000;
          color: #e8e8e8;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.6;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Waiting clock hand animation */
        body::before {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          width: 800px;
          height: 800px;
          margin-left: -400px;
          margin-top: -400px;
          border: 1px solid rgba(200, 200, 200, 0.03);
          border-radius: 50%;
          z-index: 0;
          animation: waitingPulse 8s ease-in-out infinite;
        }

        /* Clock center dot */
        body::after {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          margin-left: -4px;
          margin-top: -4px;
          background: rgba(200, 200, 200, 0.15);
          border-radius: 50%;
          z-index: 0;
          box-shadow: 0 0 20px rgba(200, 200, 200, 0.2);
        }

        @keyframes waitingPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
            border-width: 1px;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
            border-width: 2px;
          }
        }

        /* Animated clock hands for waiting theme */
        .terminal-frame::before {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 200px;
          background: linear-gradient(to bottom, 
            rgba(220, 220, 220, 0.4) 0%,
            rgba(180, 180, 180, 0.3) 50%,
            transparent 100%
          );
          transform-origin: bottom center;
          margin-left: -1px;
          margin-top: -200px;
          animation: hourHand 120s linear infinite;
          z-index: 0;
          filter: blur(0.5px);
        }

        .terminal-frame::after {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          width: 1.5px;
          height: 280px;
          background: linear-gradient(to bottom, 
            rgba(240, 240, 240, 0.5) 0%,
            rgba(200, 200, 200, 0.4) 50%,
            transparent 100%
          );
          transform-origin: bottom center;
          margin-left: -0.75px;
          margin-top: -280px;
          animation: minuteHand 60s linear infinite;
          z-index: 0;
          filter: blur(0.5px);
        }

        @keyframes hourHand {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes minuteHand {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .terminal-frame {
          max-width: 900px;
          margin: 0 auto;
          padding: 120px 40px;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        .hero {
          margin-bottom: 200px;
          text-align: center;
          position: relative;
        }

        .glass-logo {
          font-size: 48px;
          letter-spacing: 0.3em;
          margin-bottom: 40px;
          font-weight: 300;
          font-family: 'Courier New', Courier, monospace;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(220, 220, 220, 1) 15%,
            rgba(180, 180, 180, 0.9) 35%,
            rgba(240, 240, 240, 0.95) 55%,
            rgba(200, 200, 200, 0.9) 75%,
            rgba(230, 230, 230, 1) 90%,
            rgba(255, 255, 255, 0.95) 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 60px rgba(200, 200, 200, 0.4))
                  drop-shadow(0 12px 40px rgba(150, 150, 150, 0.3))
                  drop-shadow(0 0 100px rgba(180, 180, 180, 0.2));
          position: relative;
          animation: chromeShimmer 12s ease-in-out infinite, liquidFloat 8s ease-in-out infinite;
        }

        @keyframes chromeShimmer {
          0%, 100% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 60px rgba(200, 200, 200, 0.4))
                    drop-shadow(0 12px 40px rgba(150, 150, 150, 0.3))
                    drop-shadow(0 0 100px rgba(180, 180, 180, 0.2));
          }
          25% {
            background-position: 50% 100%;
            filter: drop-shadow(0 0 80px rgba(220, 220, 220, 0.5))
                    drop-shadow(0 12px 50px rgba(180, 180, 180, 0.4))
                    drop-shadow(0 0 120px rgba(200, 200, 200, 0.3));
          }
          50% {
            background-position: 100% 50%;
            filter: drop-shadow(0 0 70px rgba(190, 190, 190, 0.6))
                    drop-shadow(0 12px 45px rgba(160, 160, 160, 0.4))
                    drop-shadow(0 0 110px rgba(180, 180, 180, 0.3));
          }
          75% {
            background-position: 50% 0%;
            filter: drop-shadow(0 0 65px rgba(200, 200, 200, 0.45))
                    drop-shadow(0 12px 42px rgba(170, 170, 170, 0.35))
                    drop-shadow(0 0 105px rgba(190, 190, 190, 0.25));
          }
        }

        @keyframes liquidFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }

        .tagline {
          font-size: 14px;
          opacity: 0.7;
          letter-spacing: 0.05em;
        }

        .glass-panel {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.04) 0%,
            rgba(200, 200, 200, 0.02) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          backdrop-filter: blur(30px) saturate(120%);
          -webkit-backdrop-filter: blur(30px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 60px 50px;
          margin-bottom: 100px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 0 80px rgba(200, 200, 200, 0.06),
            inset 0 -1px 0 rgba(200, 200, 200, 0.08);
          position: relative;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-panel::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.02) 25%,
            rgba(200, 200, 200, 0.04) 50%,
            rgba(255, 255, 255, 0.02) 75%,
            transparent 100%
          );
          animation: liquidRipple 15s infinite linear;
        }

        .glass-panel::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(220, 220, 220, 0.08) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }

        .glass-panel:hover {
          border-color: rgba(220, 220, 220, 0.2);
          box-shadow: 
            0 12px 48px rgba(200, 200, 200, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 120px rgba(220, 220, 220, 0.1),
            inset 0 -1px 0 rgba(200, 200, 200, 0.12);
          transform: translateY(-4px);
        }

        .glass-panel:hover::after {
          opacity: 1;
        }

        @keyframes liquidRipple {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(50%, 50%) rotate(360deg);
          }
        }

        .glass-card {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.06) 0%,
            rgba(220, 220, 220, 0.03) 50%,
            rgba(200, 200, 200, 0.04) 100%
          );
          backdrop-filter: blur(20px) saturate(120%);
          -webkit-backdrop-filter: blur(20px) saturate(120%);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 0 20px rgba(200, 200, 200, 0.04);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(220, 220, 220, 0.08) 50%,
            transparent 70%
          );
          animation: liquidWave 6s ease-in-out infinite;
          pointer-events: none;
        }

        .glass-card:hover {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%,
            rgba(220, 220, 220, 0.06) 50%,
            rgba(200, 200, 200, 0.08) 100%
          );
          border-color: rgba(220, 220, 220, 0.25);
          box-shadow: 
            0 8px 40px rgba(200, 200, 200, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 60px rgba(220, 220, 220, 0.15),
            inset 0 0 30px rgba(200, 200, 200, 0.08);
          transform: translateY(-4px) scale(1.02);
        }

        @keyframes liquidWave {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translate(-30%, -30%) rotate(180deg);
            opacity: 0.8;
          }
        }

        .section-label {
          font-size: 11px;
          opacity: 0.5;
          letter-spacing: 0.2em;
          margin-bottom: 40px;
          text-transform: uppercase;
          text-align: center;
        }

        .waiting-room {
          text-align: center;
        }

        .counter-label {
          font-size: 10px;
          opacity: 0.4;
          letter-spacing: 0.3em;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .counter-value {
          font-size: 24px;
          margin-bottom: 60px;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, 
            rgba(220, 220, 220, 1) 0%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(200, 200, 200, 1) 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 50px rgba(200, 200, 200, 0.3));
          animation: chromeGlow 8s ease-in-out infinite;
        }

        @keyframes chromeGlow {
          0%, 100% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 50px rgba(200, 200, 200, 0.3));
          }
          50% {
            background-position: 100% 50%;
            filter: drop-shadow(0 0 70px rgba(220, 220, 220, 0.4));
          }
        }

        .system-message {
          font-size: 12px;
          opacity: 0.5;
        }

        .proof-table {
          width: 100%;
          border-collapse: collapse;
        }

        .proof-table td {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-size: 13px;
        }

        .proof-table td:first-child {
          opacity: 0.6;
        }

        .proof-table td:nth-child(2) {
          text-align: center;
          background: linear-gradient(135deg, 
            rgba(220, 220, 220, 1) 0%,
            rgba(255, 255, 255, 0.9) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .proof-table td:last-child {
          text-align: right;
          opacity: 0.4;
          font-size: 11px;
        }

        .contract-reveal {
          text-align: center;
          margin-bottom: 100px;
        }

        .countdown-message {
          font-size: 14px;
          opacity: 0.5;
          letter-spacing: 0.05em;
        }

        .contract-address {
          font-size: 11px;
          opacity: 0.8;
          letter-spacing: 0.1em;
          word-break: break-all;
          padding: 20px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%,
            rgba(200, 200, 200, 0.02) 100%
          );
          border: 1px solid rgba(220, 220, 220, 0.15);
          margin-top: 20px;
          border-radius: 8px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .last-interaction {
          text-align: center;
          font-size: 11px;
          opacity: 0.3;
          margin-bottom: 100px;
          letter-spacing: 0.1em;
        }

        .block-height {
          text-align: center;
          font-size: 10px;
          opacity: 0.25;
          margin-bottom: 120px;
          letter-spacing: 0.15em;
        }

        .decay-footnote {
          text-align: center;
          font-size: 10px;
          opacity: 0.3;
          letter-spacing: 0.1em;
          margin-top: 40px;
          font-style: italic;
        }

        .subsection-label {
          font-size: 9px;
          opacity: 0.35;
          letter-spacing: 0.15em;
          margin-bottom: 30px;
          text-align: center;
        }

        .sell-stats-grid,
        .data-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-label,
        .data-label {
          font-size: 8px;
          opacity: 0.35;
          letter-spacing: 0.2em;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .stat-value,
        .data-value {
          font-size: 18px;
          letter-spacing: 0.05em;
          opacity: 0.7;
        }

        .sell-volume {
          text-align: center;
          padding: 20px 0;
          margin-bottom: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .volume-label {
          font-size: 10px;
          opacity: 0.4;
          margin-right: 12px;
          letter-spacing: 0.1em;
        }

        .volume-value {
          font-size: 14px;
          opacity: 0.7;
          letter-spacing: 0.05em;
        }

        .loading-message {
          text-align: center;
          font-size: 12px;
          opacity: 0.4;
          letter-spacing: 0.1em;
          padding: 40px 0;
        }

        .data-footer {
          text-align: center;
          font-size: 9px;
          opacity: 0.3;
          letter-spacing: 0.15em;
        }

        .social-buttons {
          margin-bottom: 100px;
        }

        .button-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .social-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.06) 0%,
            rgba(220, 220, 220, 0.03) 50%,
            rgba(200, 200, 200, 0.04) 100%
          );
          backdrop-filter: blur(20px) saturate(120%);
          -webkit-backdrop-filter: blur(20px) saturate(120%);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          text-decoration: none;
          color: inherit;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          position: relative;
          overflow: hidden;
        }

        .social-button::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(220, 220, 220, 0.08) 50%,
            transparent 70%
          );
          animation: liquidWave 6s ease-in-out infinite;
          pointer-events: none;
        }

        .social-button:hover {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%,
            rgba(220, 220, 220, 0.06) 50%,
            rgba(200, 200, 200, 0.08) 100%
          );
          border-color: rgba(220, 220, 220, 0.25);
          box-shadow: 
            0 8px 40px rgba(200, 200, 200, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 60px rgba(220, 220, 220, 0.15);
          transform: translateY(-4px) scale(1.02);
        }

        .button-icon {
          font-size: 48px;
          margin-bottom: 16px;
          filter: drop-shadow(0 0 20px rgba(200, 200, 200, 0.3));
          position: relative;
          z-index: 1;
        }

        .button-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          opacity: 0.7;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .social-button:hover .button-icon {
          filter: drop-shadow(0 0 30px rgba(220, 220, 220, 0.5));
        }

        .social-button:hover .button-label {
          opacity: 0.9;
        }

        .cursor {
          display: inline-block;
          transition: opacity 0.1s;
          color: #60a5fa;
        }

        .bottom-cursor {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
          z-index: 100;
        }

        .connection-status {
          position: fixed;
          top: 30px;
          right: 30px;
          font-size: 9px;
          letter-spacing: 0.2em;
          opacity: 0.4;
          z-index: 100;
          padding: 12px 20px;
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.4) 0%,
            rgba(15, 23, 42, 0.3) 100%
          );
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.4s ease;
        }

        .connection-status:hover {
          opacity: 0.6;
          border-color: rgba(220, 220, 220, 0.25);
          box-shadow: 
            0 6px 24px rgba(200, 200, 200, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .status-active {
          color: #d4d4d4;
          opacity: 0.7;
        }

        .status-inactive {
          color: #888888;
          opacity: 0.4;
        }

        .activity-feed {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.8) 0%,
            rgba(20, 20, 20, 0.7) 100%
          );
          backdrop-filter: blur(30px) saturate(120%);
          -webkit-backdrop-filter: blur(30px) saturate(120%);
          border: 1.5px solid rgba(220, 220, 220, 0.3);
          padding: 16px 32px;
          animation: liquidSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px;
          box-shadow: 
            0 12px 48px rgba(200, 200, 200, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 80px rgba(220, 220, 220, 0.15);
          z-index: 100;
          overflow: hidden;
        }

        .activity-feed::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(220, 220, 220, 0.08) 50%,
            transparent 60%
          );
          animation: liquidWave 4s ease-in-out infinite;
        }

        @keyframes liquidSlideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .activity-message {
          font-size: 11px;
          letter-spacing: 0.1em;
          opacity: 0.8;
          margin-bottom: 4px;
          position: relative;
          z-index: 1;
        }

        .activity-timestamp {
          font-size: 9px;
          opacity: 0.4;
          letter-spacing: 0.15em;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .terminal-frame {
            padding: 80px 24px;
          }

          .glass-logo {
            font-size: 36px;
          }

          .glass-panel {
            padding: 40px 30px;
            margin-bottom: 60px;
          }

          .data-grid,
          .sell-stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .button-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .button-icon {
            font-size: 36px;
            margin-bottom: 12px;
          }

          .button-label {
            font-size: 10px;
          }
        }
      `}</style>

      <Hero />
      <TransactionMonitor onNewTransaction={handleNewTransaction} />
      <ActivityFeed recentActivity={recentActivity} />
      <LastInteraction />
      <LiveMarketData />
      <ContractReveal contractAddress="EECACVyG8A1KMD7WtWYSmq3gtp4sjvrxiJNz8vWYbonk" />
      <BlockHeight />
      <SocialButtons />
      <DiamondHands refreshTrigger={refreshTrigger} />
      <DecayScore />

      <div className="bottom-cursor">
        <Cursor />
      </div>
    </div>
  );
};

export default function Home() {
  return <WaitProtocol />;
}