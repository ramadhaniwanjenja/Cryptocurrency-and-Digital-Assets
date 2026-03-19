// Navbar component - show on every page
// it handle wallet connection and navigation between pages

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { connectWallet, shortenAddress, getTokenContract } from "../utils/contracts";
import { ethers } from "ethers";

function Navbar({ wallet, setWallet }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  // this function handle the connect wallet button click
  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      const { provider, signer, address } = await connectWallet();

      // try to get balance but dont crash if contract not reachable
let balance = "0";
try {
  const tokenContract = getTokenContract(provider);
  const rawBalance = await tokenContract.balanceOf(address);
  balance = ethers.formatUnits(rawBalance, 18);
} catch (err) {
  console.warn("Could not fetch token balance:", err.message);
  balance = "0";
}

// check if user is on Sepolia (chainId 11155111)
const network = await provider.getNetwork();
const chainId = Number(network.chainId);
// Sepolia chainId is 11155111 - log it so we can debug
console.log("Connected chainId:", chainId);
const isCorrectNetwork = chainId === 11155111 || chainId === 11155111n;

setWallet({ provider, signer, address, balance, chainId, isCorrectNetwork });
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    }
    setConnecting(false);
  }

  // this function handle disconnect
  function handleDisconnect() {
    setWallet(null);
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* logo and brand name */}
        <Link to="/" style={styles.brand}>
          🎓 ALU Logo dApp
        </Link>

        {/* navigation links */}
        <div style={styles.links}>
          <Link
            to="/"
            style={location.pathname === "/" ? styles.activeLink : styles.link}
          >
            Home
          </Link>
          <Link
            to="/register"
            style={location.pathname === "/register" ? styles.activeLink : styles.link}
          >
            Register
          </Link>
          <Link
            to="/verify"
            style={location.pathname === "/verify" ? styles.activeLink : styles.link}
          >
            Verify
          </Link>
          <Link
            to="/dashboard"
            style={location.pathname === "/dashboard" ? styles.activeLink : styles.link}
          >
            Dashboard
          </Link>
        </div>

        {/* wallet connection area */}
        <div style={styles.walletArea}>
          {wallet ? (
            <div style={styles.connected}>
              <span style={styles.balanceBadge}>
                {parseFloat(wallet.balance).toFixed(0)} ALUT
              </span>
              <span style={styles.addressBadge}>
                {shortenAddress(wallet.address)}
              </span>
              <button onClick={handleDisconnect} style={styles.disconnectBtn}>
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleConnect}
                disabled={connecting}
                style={styles.connectBtn}
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
              {error && (
                <div style={{ color: "#ef4444", fontSize: "12px", marginTop: 4 }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    padding: "0 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    gap: 20,
  },
  brand: {
    color: "white",
    fontWeight: 700,
    fontSize: 18,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  links: {
    display: "flex",
    gap: 8,
  },
  link: {
    color: "#a0aec0",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s",
  },
  activeLink: {
    color: "white",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: "rgba(255,255,255,0.1)",
  },
  walletArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  connected: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  balanceBadge: {
    background: "rgba(79,70,229,0.3)",
    color: "#a5b4fc",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  addressBadge: {
    background: "rgba(255,255,255,0.1)",
    color: "white",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  connectBtn: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "white",
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
  },
  disconnectBtn: {
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    padding: "6px 12px",
    fontSize: 12,
    borderRadius: 8,
  },
};

export default Navbar;
