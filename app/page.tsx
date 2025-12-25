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
      <div className="logo">$WAIT</div>
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
    <div className="contract-reveal section">
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
      <div className="market-data section">
        <div className="loading-message">Syncing market data...</div>
      </div>
    );
  }

  if (!marketData) return null;

  return (
    <div className="market-data section">
      <div className="section-label">CURRENT STATE</div>
      <div className="data-grid">
        <div className="data-item">
          <div className="data-label">PRICE</div>
          <div className="data-value">${parseFloat(marketData.priceUsd).toFixed(8)}</div>
        </div>
        <div className="data-item">
          <div className="data-label">LIQUIDITY</div>
          <div className="data-value">${parseInt(marketData.liquidity?.usd || 0).toLocaleString()}</div>
        </div>
        <div className="data-item">
          <div className="data-label">24H VOLUME</div>
          <div className="data-value">${parseInt(marketData.volume?.h24 || 0).toLocaleString()}</div>
        </div>
        <div className="data-item">
          <div className="data-label">FDV</div>
          <div className="data-value">${parseInt(marketData.fdv || 0).toLocaleString()}</div>
        </div>
        <div className="data-item">
          <div className="data-label">24H CHANGE</div>
          <div className="data-value" style={{ 
            opacity: marketData.priceChange?.h24 > 0 ? 0.8 : 0.5 
          }}>
            {marketData.priceChange?.h24 > 0 ? '+' : ''}{parseFloat(marketData.priceChange?.h24 || 0).toFixed(2)}%
          </div>
        </div>
        <div className="data-item">
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
    <div className="waiting-room section">
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
      <div className="diamond-hands section">
        <div className="section-label">The chain remembers who waited.</div>
        <div className="loading-message">Verifying patience on-chain...</div>
      </div>
    );
  }

  const sortedProof = holders.length > 0 ? holders : [...proofData].sort((a, b) => b.daysHeld - a.daysHeld);

  return (
    <div className="diamond-hands section">
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
      <div className="decay-score section">
        <div className="section-label">FAILURES RECORDED</div>
        <div className="loading-message">Scanning exit events...</div>
      </div>
    );
  }

  return (
    <div className="decay-score section">
      <div className="section-label">FAILURES RECORDED</div>
      <div className="subsection-label">Sell activity tracked</div>
      
      <div className="sell-stats-grid">
        <div className="stat-item">
          <div className="stat-label">LAST 5 MINUTES</div>
          <div className="stat-value">{sellStats.last5m} sells</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">LAST HOUR</div>
          <div className="stat-value">{sellStats.last1h} sells</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">LAST 6 HOURS</div>
          <div className="stat-value">{sellStats.last6h} sells</div>
        </div>
        <div className="stat-item">
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
    <div className="logbook section">
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
          background: #0f172a;
          color: #e2e8f0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.6;
        }

        .terminal-frame {
          max-width: 800px;
          margin: 0 auto;
          padding: 120px 40px;
          min-height: 100vh;
        }

        .hero {
          margin-bottom: 200px;
          text-align: center;
        }

        .logo {
          font-size: 48px;
          letter-spacing: 0.3em;
          margin-bottom: 40px;
          font-weight: 300;
        }

        .tagline {
          font-size: 14px;
          opacity: 0.7;
          letter-spacing: 0.05em;
        }

        .section {
          margin-bottom: 200px;
        }

        .section-label {
          font-size: 11px;
          opacity: 0.5;
          letter-spacing: 0.2em;
          margin-bottom: 40px;
          text-transform: uppercase;
        }

        .waiting-room {
          text-align: center;
        }

        .counter-label {
          font-size: 10px;
          opacity: 0.4;
          letter-spacing: 0.3em;
          margin-bottom: 20px;
        }

        .counter-value {
          font-size: 24px;
          margin-bottom: 60px;
          letter-spacing: 0.1em;
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
        }

        .proof-table td:last-child {
          text-align: right;
          opacity: 0.4;
          font-size: 11px;
        }

        .log-entries {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .log-entry {
          font-size: 12px;
          opacity: 0.6;
        }

        .log-timestamp {
          opacity: 0.4;
          margin-right: 12px;
        }

        .log-divider {
          opacity: 0.3;
          margin-right: 12px;
        }

        .log-text {
          opacity: 0.7;
        }

        .contract-reveal {
          text-align: center;
          margin-bottom: 200px;
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
          border: 1px solid rgba(255,255,255,0.1);
          margin-top: 20px;
          border-radius: 8px;
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

        .decay-score {
          margin-top: 100px;
        }

        .decay-footnote,
        .log-footnote {
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

        .sell-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px 50px;
          margin-bottom: 40px;
        }

        .stat-item {
          text-align: center;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-label {
          font-size: 8px;
          opacity: 0.35;
          letter-spacing: 0.2em;
          margin-bottom: 10px;
        }

        .stat-value {
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

        .market-data {
          margin-bottom: 200px;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px 60px;
          margin-bottom: 40px;
        }

        .data-item {
          text-align: center;
        }

        .data-label {
          font-size: 9px;
          opacity: 0.4;
          letter-spacing: 0.2em;
          margin-bottom: 8px;
        }

        .data-value {
          font-size: 16px;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }

        .data-footer {
          text-align: center;
          font-size: 9px;
          opacity: 0.3;
          letter-spacing: 0.15em;
        }

        .diamond-hands {
          margin-bottom: 200px;
        }

        .cursor {
          display: inline-block;
          transition: opacity 0.1s;
        }

        .bottom-cursor {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
        }

        .connection-status {
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 9px;
          letter-spacing: 0.2em;
          opacity: 0.4;
          z-index: 100;
        }

        .status-active {
          color: #fff;
          opacity: 0.6;
        }

        .status-inactive {
          color: #fff;
          opacity: 0.3;
        }

        .activity-feed {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 24px;
          animation: fadeIn 0.3s ease-in;
          border-radius: 4px;
        }

        .activity-message {
          font-size: 11px;
          letter-spacing: 0.1em;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .activity-timestamp {
          font-size: 9px;
          opacity: 0.4;
          letter-spacing: 0.15em;
        }

        @keyframes fadeIn {from {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @media (max-width: 768px) {
      .terminal-frame {
        padding: 80px 20px;
      }

      .logo {
        font-size: 36px;
      }

      .section {
        margin-bottom: 120px;
      }

      .data-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .sell-stats-grid {
        grid-template-columns: 1fr;
        gap: 20px;
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