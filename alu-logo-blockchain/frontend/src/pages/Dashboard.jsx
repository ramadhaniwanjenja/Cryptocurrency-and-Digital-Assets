// Dashboard page - shows ALUT token ownership
// and allows the contract owner to distribute shares

import { useState, useEffect } from "react";
import { getTokenContract, shortenAddress } from "../utils/contracts";
import { ethers } from "ethers";
import CONTRACT_ADDRESSES from "../utils/contractAddresses";
import ALULogoTokenABI from "../utils/ALULogoTokenABI";

// some example wallets to show ownership breakdown
// in real life these would be fetched from blockchain events
const EXAMPLE_WALLETS = [
  { label: "ALU Administration", address: "0xe083aa1c4d481c0dc332649a9f59c8f2924eAE4E" },
  { label: "Faculty Representative", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  { label: "Student Council", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
];

function Dashboard({ wallet }) {
  const [totalSupply, setTotalSupply] = useState("0");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [myBalance, setMyBalance] = useState("0");
  const [myPercentage, setMyPercentage] = useState("0");
  const [exampleBalances, setExampleBalances] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  // load all contract data when page loads or wallet changes
  useEffect(() => {
    loadContractData();
  }, [wallet]);

  async function loadContractData() {
    setLoading(true);
    setError("");
    try {
      // use read only provider if no wallet connected
      let provider;
      if (wallet) {
        provider = wallet.provider;
      } else {
        provider = new ethers.JsonRpcProvider(
          "https://eth-sepolia.g.alchemy.com/v2/LzouhnhWNVT32hk6sctJA"
        );
      }

      const contract = getTokenContract(provider);

      // fetch total supply
      const supply = await contract.totalSupply();
      setTotalSupply(ethers.formatUnits(supply, 18));

      // fetch contract owner address
      const contractOwner = await contract.owner();
      setOwnerAddress(contractOwner);

      // check if connected wallet is the owner
      if (wallet) {
        const ownerMatch = contractOwner.toLowerCase() === wallet.address.toLowerCase();
        setIsOwner(ownerMatch);

        // fetch connected wallet balance and percentage
        const bal = await contract.balanceOf(wallet.address);
        setMyBalance(ethers.formatUnits(bal, 18));

        const pct = await contract.ownershipPercentage(wallet.address);
        setMyPercentage(pct.toString());
      }

      // fetch example wallet balances
      const examples = await Promise.all(
        EXAMPLE_WALLETS.map(async (w) => {
          try {
            const bal = await contract.balanceOf(w.address);
            const pct = await contract.ownershipPercentage(w.address);
            return {
              ...w,
              balance: ethers.formatUnits(bal, 18),
              percentage: pct.toString(),
            };
          } catch {
            return { ...w, balance: "0", percentage: "0" };
          }
        })
      );
      setExampleBalances(examples);

    } catch (err) {
      setError("Failed to load contract data: " + err.message);
    }
    setLoading(false);
  }

  // this function distribute shares to a recipient
  // only the contract owner can call this
  async function handleDistribute(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!wallet) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!isOwner) {
      setError("Only the contract owner can distribute shares.");
      return;
    }
    if (!recipient || !ethers.isAddress(recipient)) {
      setError("Please enter a valid wallet address.");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    setDistributing(true);
    try {
      const contract = getTokenContract(wallet.signer);

      // convert amount to wei (18 decimals)
      const amountWei = ethers.parseUnits(amount.toString(), 18);

      // call distributeShares - MetaMask will ask for approval
      const tx = await contract.distributeShares(recipient, amountWei);
      await tx.wait();

      setSuccess(`✅ Successfully distributed ${amount} ALUT to ${shortenAddress(recipient)}! Transaction: ${tx.hash}`);

      // reload data to show updated balances
      setRecipient("");
      setAmount("");
      await loadContractData();

    } catch (err) {
      if (err.message.includes("user rejected")) {
        setError("❌ You rejected the transaction in MetaMask.");
      } else if (err.message.includes("Not enough tokens")) {
        setError("❌ Not enough tokens to distribute.");
      } else {
        setError("❌ Error: " + err.message);
      }
    }
    setDistributing(false);
  }

  // calculate percentage bar width
  function getBarWidth(percentage) {
    const pct = parseFloat(percentage);
    return Math.max(pct, 0.5) + "%";
  }

  return (
    <div className="page">
      <h1 style={styles.title}>📊 Token Ownership Dashboard</h1>
      <p style={styles.subtitle}>
        View ALUT token distribution and manage ownership shares of the ALU logo.
      </p>

      {loading && <div className="loading-msg">⏳ Loading contract data...</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* overview stats */}
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>🪙</div>
          <div style={styles.statValue}>
            {parseFloat(totalSupply).toLocaleString()}
          </div>
          <div style={styles.statLabel}>Total ALUT Supply</div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>👛</div>
          <div style={styles.statValue}>
            {wallet ? parseFloat(myBalance).toLocaleString() : "—"}
          </div>
          <div style={styles.statLabel}>Your ALUT Balance</div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statValue}>
            {wallet ? myPercentage + "%" : "—"}
          </div>
          <div style={styles.statLabel}>Your Ownership %</div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>
            {isOwner ? "👑" : "👤"}
          </div>
          <div style={{ ...styles.statValue, fontSize: 14 }}>
            {ownerAddress ? shortenAddress(ownerAddress) : "—"}
          </div>
          <div style={styles.statLabel}>Contract Owner</div>
        </div>
      </div>

      {/* ownership breakdown */}
      <div className="card">
        <h2 style={styles.sectionTitle}>Ownership Breakdown</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          Example stakeholder wallets and their ownership percentages
        </p>

        {exampleBalances.map((w, i) => (
          <div key={i} style={styles.ownerRow}>
            <div style={styles.ownerInfo}>
              <div style={styles.ownerLabel}>{w.label}</div>
              <div style={styles.ownerAddress}>{shortenAddress(w.address)}</div>
            </div>
            <div style={styles.barContainer}>
              <div
                style={{
                  ...styles.bar,
                  width: getBarWidth(w.percentage),
                  background: i === 0 ? "#4f46e5" : i === 1 ? "#059669" : "#dc2626",
                }}
              />
            </div>
            <div style={styles.ownerPct}>{w.percentage}%</div>
            <div style={styles.ownerBal}>
              {parseFloat(w.balance).toLocaleString()} ALUT
            </div>
          </div>
        ))}

        {/* connected wallet row */}
        {wallet && (
          <div style={{ ...styles.ownerRow, background: "#f0f4ff", borderRadius: 8, padding: "12px 8px" }}>
            <div style={styles.ownerInfo}>
              <div style={styles.ownerLabel}>You (Connected Wallet)</div>
              <div style={styles.ownerAddress}>{shortenAddress(wallet.address)}</div>
            </div>
            <div style={styles.barContainer}>
              <div
                style={{
                  ...styles.bar,
                  width: getBarWidth(myPercentage),
                  background: "#f59e0b",
                }}
              />
            </div>
            <div style={styles.ownerPct}>{myPercentage}%</div>
            <div style={styles.ownerBal}>
              {parseFloat(myBalance).toLocaleString()} ALUT
            </div>
          </div>
        )}
      </div>

      {/* distribute shares form - only show to owner */}
      <div className="card">
        <h2 style={styles.sectionTitle}>
          {isOwner ? "👑 Distribute Ownership Shares" : "🔒 Share Distribution"}
        </h2>

        {!wallet && (
          <div className="error-msg">
            Connect your wallet to see if you can distribute shares.
          </div>
        )}

        {wallet && !isOwner && (
          <div style={styles.notOwnerBox}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
            <p style={{ fontWeight: 600, color: "#92400e" }}>
              Only the contract owner can distribute shares.
            </p>
            <p style={{ fontSize: 13, color: "#78716c", marginTop: 4 }}>
              Contract owner: {shortenAddress(ownerAddress)}
            </p>
          </div>
        )}

        {wallet && isOwner && (
          <form onSubmit={handleDistribute}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              As the contract owner you can transfer ALUT tokens to any wallet address.
            </p>

            <div style={styles.formRow}>
              <label style={styles.label}>Recipient Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>Amount of ALUT tokens</label>
              <input
                type="number"
                placeholder="e.g. 100000"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p style={styles.hint}>
                You currently have {parseFloat(myBalance).toLocaleString()} ALUT available
              </p>
            </div>

            <button
              type="submit"
              disabled={distributing}
              style={styles.distributeBtn}
            >
              {distributing ? "⏳ Distributing..." : "📤 Distribute Shares"}
            </button>
          </form>
        )}

        {success && <div className="success-msg">{success}</div>}
        {error && !loading && <div className="error-msg">{error}</div>}
      </div>

    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" },
  subtitle: { color: "#64748b", marginBottom: 24, fontSize: 14 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    textAlign: "center",
    padding: 20,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 14, color: "#1a1a2e", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  sectionTitle: { fontSize: 17, fontWeight: 700, marginBottom: 6, color: "#1a1a2e" },
  ownerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  ownerInfo: { minWidth: 160 },
  ownerLabel: { fontWeight: 600, fontSize: 13, color: "#1a1a2e" },
  ownerAddress: { fontSize: 11, color: "#94a3b8", fontFamily: "monospace" },
  barContainer: {
    flex: 1,
    background: "#f1f5f9",
    borderRadius: 20,
    height: 8,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 20,
    transition: "width 0.6s ease",
  },
  ownerPct: { minWidth: 40, fontWeight: 700, fontSize: 13, color: "#1a1a2e" },
  ownerBal: { minWidth: 100, fontSize: 12, color: "#64748b", textAlign: "right" },
  notOwnerBox: {
    background: "#fef3c7",
    borderRadius: 10,
    padding: 20,
    textAlign: "center",
  },
  formRow: { marginBottom: 16 },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 13,
    color: "#374151",
  },
  hint: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  distributeBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "white",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    marginTop: 8,
  },
};

export default Dashboard;
