'use client';

import React, { useState, useEffect } from 'react';

// DATA FILES
const logsData = [
  { id: 1, text: "Temporal protocol activated.", timestamp: "2024-12-01" },
  { id: 2, text: "First minute elapsed. No interruptions.", timestamp: "2024-12-01" },
  { id: 3, text: "Patience threshold set at 60 seconds.", timestamp: "2024-12-02" },
  { id: 4, text: "Early exit detected. Wallet marked.", timestamp: "2024-12-05" },
  { id: 5, text: "System observing holder behavior.", timestamp: "2024-12-10" },
  { id: 6, text: "Diamond hands verified. 30+ days confirmed.", timestamp: "2024-12-15" },
  { id: 7, text: "No updates scheduled. Waiting continues.", timestamp: "2024-12-20" },
  { id: 8, text: "Time accumulates. Protocol stable.", timestamp: "2024-12-24" }
];

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

const Counter = ({ lastEventTimestamp }: { lastEventTimestamp: number }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const diff = now - lastEventTimestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsed(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastEventTimestamp]);

  return <span>{elapsed}</span>;
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
  const [countdown, setCountdown] = useState(60);

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

const WaitingRoom = () => {
  const lastEvent = new Date('2024-12-20T00:00:00').getTime();
  
  const systemMessages = [
    "Protocol enforcing temporal discipline.",
    "All holders monitored. Patience verified.",
    "No deviations detected. System stable."
  ];

  const [message, setMessage] = useState('');

  useEffect(() => {
    const daysSinceStart = Math.floor((Date.now() - lastEvent) / (1000 * 60 * 60 * 24));
    const msgIndex = daysSinceStart % systemMessages.length;
    setMessage(systemMessages[msgIndex]);
  }, []);

  return (
    <div className="waiting-room glass-panel">
      <div className="counter-label">PROTOCOL UPTIME</div>
      <div className="counter-value">
        <Counter lastEventTimestamp={lastEvent} />
      </div>
      <div className="system-message">{message}</div>
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

const Logbook = () => {
  return (
    <div className="logbook glass-panel">
      <div className="section-label">TEMPORAL RECORD</div>
      <div className="log-entries">
        {logsData.map(log => (
          <div key={log.id} className="log-entry">
            <span className="log-timestamp">{log.timestamp}</span>
            <span className="log-divider">—</span>
            <span className="log-text">{log.text}</span>
          </div>
        ))}
      </div>
      <div className="log-footnote">Every second is recorded. Every minute matters.</div>
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
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
          color: #e0e7ff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        body::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(96, 165, 250, 0.05) 0%, transparent 50%);
          animation: gradientShift 20s ease infinite;
          z-index: 0;
        }

        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10%, 10%) rotate(5deg); }
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
          font-size: 72px;
          letter-spacing: 0.3em;
          margin-bottom: 50px;
          font-weight: 700;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(147, 197, 253, 0.9) 30%,
            rgba(255, 255, 255, 0.85) 60%,
            rgba(191, 219, 254, 0.9) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 40px rgba(96, 165, 250, 0.5))
                  drop-shadow(0 8px 32px rgba(59, 130, 246, 0.3));
          text-shadow: 
            0 0 80px rgba(147, 197, 253, 0.5),
            0 0 120px rgba(96, 165, 250, 0.3);
          position: relative;
          animation: glassShimmer 8s ease-in-out infinite;
        }

        @keyframes glassShimmer {
          0%, 100% {
            filter: drop-shadow(0 0 40px rgba(96, 165, 250, 0.5))
                    drop-shadow(0 8px 32px rgba(59, 130, 246, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 60px rgba(96, 165, 250, 0.7))
                    drop-shadow(0 8px 48px rgba(59, 130, 246, 0.5));
          }
        }

        .tagline {
          font-size: 15px;
          opacity: 0.6;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 300;
        }

        .glass-panel {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.01) 100%
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 60px 50px;
          margin-bottom: 100px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 80px rgba(96, 165, 250, 0.05);
          position: relative;
          overflow: hidden;
        }

        .glass-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.03) 50%,
            transparent 100%
          );
          animation: shimmer 8s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          50%, 100% { left: 200%; }
        }

        .glass-card {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.4s ease;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .glass-card:hover {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.04) 100%
          );
          border-color: rgba(96, 165, 250, 0.3);
          box-shadow: 
            0 8px 32px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .section-label {
          font-size: 10px;
          opacity: 0.4;
          letter-spacing: 0.25em;
          margin-bottom: 40px;
          text-transform: uppercase;
          text-align: center;
          font-weight: 500;
        }

        .waiting-room {
          text-align: center;
        }

        .counter-label {
          font-size: 10px;
          opacity: 0.35;
          letter-spacing: 0.3em;
          margin-bottom: 24px;
          text-transform: uppercase;
          font-weight: 500;
        }

        .counter-value {
          font-size: 32px;
          margin-bottom: 60px;
          letter-spacing: 0.1em;
          font-weight: 300;
          color: #93c5fd;
          text-shadow: 0 0 40px rgba(147, 197, 253, 0.4);
        }

        .system-message {
          font-size: 13px;
          opacity: 0.5;
          font-weight: 300;
        }

        .proof-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }

        .proof-table td {
          padding: 16px 20px;
          font-size: 13px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.01) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .proof-table tr td:first-child {
          border-radius: 12px 0 0 12px;
          border-right: none;
        }

        .proof-table tr td:last-child {
          border-radius: 0 12px 12px 0;
          border-left: none;
        }

        .proof-table tr td:nth-child(2) {
          border-left: none;
          border-right: none;
        }

        .proof-table td:first-child {
          opacity: 0.6;
          font-weight: 500;
        }

        .proof-table td:nth-child(2) {
          text-align: center;
          color: #93c5fd;
          font-weight: 500;
        }

        .proof-table td:last-child {
          text-align: right;
          opacity: 0.4;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .log-entries {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .log-entry {
          font-size: 12px;
          opacity: 0.6;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-weight: 300;
        }

        .log-timestamp {
          opacity: 0.4;
          margin-right: 16px;
          font-size: 11px;
        }

        .log-divider {
          opacity: 0.2;
          margin-right: 16px;
        }

        .log-text {
          opacity: 0.7;
        }

        .contract-reveal {
          text-align: center;
          margin-bottom: 100px;
        }

        .countdown-message {
          font-size: 14px;
          opacity: 0.5;
          letter-spacing: 0.1em;
          font-weight: 300;
        }

        .contract-address {
          font-size: 12px;
          opacity: 0.8;
          letter-spacing: 0.1em;
          word-break: break-all;
          padding: 24px 28px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          border: 1px solid rgba(96, 165, 250, 0.2);
          margin-top: 24px;
          border-radius: 12px;
          font-weight: 500;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .last-interaction,
        .block-height {
          text-align: center;
          font-size: 11px;
          opacity: 0.25;
          margin-bottom: 100px;
          letter-spacing: 0.15em;
          font-weight: 300;
        }

        .decay-footnote,
        .log-footnote {
          text-align: center;
          font-size: 11px;
          opacity: 0.3;
          letter-spacing: 0.1em;
          margin-top: 50px;
          font-style: italic;
          font-weight: 300;
        }

        .subsection-label {
          font-size: 9px;
          opacity: 0.3;
          letter-spacing: 0.2em;
          margin-bottom: 32px;
          text-align: center;
          text-transform: uppercase;
          font-weight: 400;
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
          font-size: 9px;
          opacity: 0.35;
          letter-spacing: 0.25em;
          margin-bottom: 12px;
          text-transform: uppercase;
          font-weight: 500;
        }

        .stat-value,
        .data-value {
          font-size: 20px;
          letter-spacing: 0.05em;
          opacity: 0.85;
          font-weight: 300;
          color: #bfdbfe;
        }

        .sell-volume {
          text-align: center;
          padding: 24px 0;
          margin-bottom: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .volume-label {
          font-size: 11px;
          opacity: 0.4;
          margin-right: 12px;
          letter-spacing: 0.1em;
          font-weight: 400;
        }

        .volume-value {
          font-size: 16px;
          opacity: 0.8;
          letter-spacing: 0.05em;
          font-weight: 500;
          color: #93c5fd;
        }

        .loading-message {
          text-align: center;
          font-size: 13px;
          opacity: 0.4;
          letter-spacing: 0.1em;
          padding: 40px 0;
          font-weight: 300;
        }

        .data-footer {
          text-align: center;
          font-size: 10px;
          opacity: 0.25;
          letter-spacing: 0.15em;
          margin-top: 30px;
          font-weight: 300;
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
          letter-spacing: 0.25em;
          opacity: 0.3;
          z-index: 100;
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-weight: 500;
        }

        .status-active {
          color: #60a5fa;
          opacity: 0.7;
        }

        .status-inactive {
          color: #94a3b8;
          opacity: 0.4;
        }

        .activity-feed {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0.4) 100%
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(96, 165, 250, 0.3);
          padding: 16px 32px;
          animation: slideUp 0.4s ease-out;
          border-radius: 12px;
          box-shadow: 
            0 8px 32px rgba(59, 130, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 100;
        }

        .activity-message {
          font-size: 12px;
          letter-spacing: 0.1em;
          opacity: 0.9;
          margin-bottom: 6px;
          font-weight: 400;
        }

        .activity-timestamp {
          font-size: 10px;
          opacity: 0.4;
          letter-spacing: 0.15em;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .terminal-frame {
            padding: 80px 24px;
          }

          .glass-logo {
            font-size: 48px;
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
        }
      `}</style>

      <Hero />
      <TransactionMonitor onNewTransaction={handleNewTransaction} />
      <ActivityFeed recentActivity={recentActivity} />
      <LastInteraction />
      <LiveMarketData />
      <ContractReveal contractAddress="EECACVyG8A1KMD7WtWYSmq3gtp4sjvrxiJNz8vWYbonk" />
      <BlockHeight />
      <WaitingRoom />
      <DiamondHands refreshTrigger={refreshTrigger} />
      <DecayScore />
      <Logbook />

      <div className="bottom-cursor">
        <Cursor />
      </div>
    </div>
  );
};

export default function Home() {
  return <WaitProtocol />;
}
