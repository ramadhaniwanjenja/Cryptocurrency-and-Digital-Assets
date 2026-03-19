// Home page - landing page of the dApp
// show overview and quick links to all features

import { Link } from "react-router-dom";

function Home({ wallet }) {
  return (
    <div className="page">

      {/* hero section */}
      <div className="card" style={styles.hero}>
        <div style={styles.heroIcon}>🛡️</div>
        <h1 style={styles.heroTitle}>ALU Logo Protection System</h1>
        <p style={styles.heroSub}>
          The official ALU logo is registered and protected on the Ethereum blockchain.
          Use this dApp to register new assets, verify logo authenticity, or manage ownership shares.
        </p>
        {!wallet && (
          <p style={styles.walletNote}>
            👆 Connect your wallet using the button in the top right to get started.
          </p>
        )}
        {wallet && (
          <p style={{ color: "#065f46", fontWeight: 600, marginTop: 14 }}>
            ✅ Wallet connected! You are ready to use all features.
          </p>
        )}
      </div>

      {/* feature cards */}
      <div style={styles.grid}>

        <Link to="/register" style={styles.featureCard}>
          <div style={styles.featureIcon}>📝</div>
          <h3 style={styles.featureTitle}>Register Asset</h3>
          <p style={styles.featureDesc}>
            Upload a logo file, generate its SHA-256 hash, and register it permanently on the blockchain as an NFT.
          </p>
          <span style={styles.featureTag}>Requires Wallet</span>
        </Link>

        <Link to="/verify" style={styles.featureCard}>
          <div style={styles.featureIcon}>🔍</div>
          <h3 style={styles.featureTitle}>Verify Logo</h3>
          <p style={styles.featureDesc}>
            Upload any logo file to instantly check if it is the real official ALU logo or a modified fake.
          </p>
          <span style={{ ...styles.featureTag, background: "#d1fae5", color: "#065f46" }}>
            No Wallet Needed
          </span>
        </Link>

        <Link to="/dashboard" style={styles.featureCard}>
          <div style={styles.featureIcon}>📊</div>
          <h3 style={styles.featureTitle}>Token Dashboard</h3>
          <p style={styles.featureDesc}>
            View ALUT token ownership percentages and distribute shares to stakeholders.
          </p>
          <span style={styles.featureTag}>Requires Wallet</span>
        </Link>

      </div>

      {/* info section */}
      <div className="card">
        <h2 style={{ marginBottom: 14, color: "#1a1a2e" }}>How It Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <span style={styles.stepNum}>1</span>
            <div>
              <strong>File is hashed in your browser</strong>
              <p style={styles.stepDesc}>
                We compute a SHA-256 fingerprint of the logo file locally — no file is ever sent to a server.
              </p>
            </div>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNum}>2</span>
            <div>
              <strong>Hash is stored on Ethereum blockchain</strong>
              <p style={styles.stepDesc}>
                The hash is written permanently to the ALUAssetRegistry smart contract as an NFT. It cannot be changed.
              </p>
            </div>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNum}>3</span>
            <div>
              <strong>Anyone can verify at any time</strong>
              <p style={styles.stepDesc}>
                Upload any logo file and we compare its hash to the one stored on blockchain. Instant, trustless verification.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  hero: {
    textAlign: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    color: "white",
  },
  heroIcon: { fontSize: 52, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: 700, marginBottom: 12 },
  heroSub: { color: "#a0aec0", fontSize: 15, maxWidth: 580, margin: "0 auto" },
  walletNote: {
    marginTop: 16,
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 24,
  },
  featureCard: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    textDecoration: "none",
    color: "#1a1a2e",
    display: "block",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  featureIcon: { fontSize: 36, marginBottom: 12 },
  featureTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  featureDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 12 },
  featureTag: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  steps: { display: "flex", flexDirection: "column", gap: 16 },
  step: { display: "flex", gap: 16, alignItems: "flex-start" },
  stepNum: {
    background: "#4f46e5",
    color: "white",
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  stepDesc: { color: "#64748b", fontSize: 13, marginTop: 4 },
};

export default Home;
