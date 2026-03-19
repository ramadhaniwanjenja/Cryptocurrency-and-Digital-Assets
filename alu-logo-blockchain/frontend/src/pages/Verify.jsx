// Verify page - allows ANYONE to verify if a logo is authentic
// no wallet connection needed because verifyLogoIntegrity is a view function

import { useState } from "react";
import { hashFile, getRegistryContract, formatDate } from "../utils/contracts";
import { ethers } from "ethers";
import CONTRACT_ADDRESSES from "../utils/contractAddresses";
import ALUAssetRegistryABI from "../utils/ALUAssetRegistryABI";

function Verify() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [manualHash, setManualHash] = useState("");
  const [tokenId, setTokenId] = useState("1");
  const [result, setResult] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("file");

  // get a read only provider - no wallet needed for verification
  // we use the public Sepolia RPC so anyone can verify
  function getReadOnlyContract() {
    const provider = new ethers.JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/LzouhnhWNVT32hk6sctJA"
    );
    return new ethers.Contract(
      CONTRACT_ADDRESSES.ALUAssetRegistry,
      ALUAssetRegistryABI,
      provider
    );
  }

  // handle file upload and auto hash it
  async function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
    setMetadata(null);
    setError("");

    // show image preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selected);

    // hash the file in browser
    setHashing(true);
    try {
      const computed = await hashFile(selected);
      setFileHash(computed);
    } catch (err) {
      setError("Failed to hash file: " + err.message);
    }
    setHashing(false);
  }

  // this function call verifyLogoIntegrity on the contract
  // it is free to call because it only reads data - no gas needed
  async function handleVerify() {
    setError("");
    setResult(null);
    setMetadata(null);
    setLoading(true);

    try {
      const hashToVerify = activeTab === "file" ? fileHash : manualHash;

      if (!hashToVerify) {
        setError("Please upload a file or enter a hash first.");
        setLoading(false);
        return;
      }

      if (!tokenId || isNaN(tokenId) || Number(tokenId) < 1) {
        setError("Please enter a valid token ID.");
        setLoading(false);
        return;
      }

      const contract = getReadOnlyContract();

      // call the view function - this cost no gas at all
      const [isAuthentic, message] = await contract.verifyLogoIntegrity(
        Number(tokenId),
        hashToVerify
      );

      setResult({ isAuthentic, message });

      // if authentic also fetch the full metadata to show registration details
      if (isAuthentic) {
        try {
          const asset = await contract.getAsset(Number(tokenId));
          setMetadata({
            assetName: asset.assetName,
            fileType: asset.fileType,
            registeredBy: asset.registeredBy,
            timestamp: asset.timestamp.toString(),
          });
        } catch (err) {
          console.warn("Could not fetch metadata:", err.message);
        }
      }
    } catch (err) {
      if (err.message.includes("Token does not exist")) {
        setError("No asset found with token ID " + tokenId);
      } else {
        setError("Error during verification: " + err.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="page">
      <h1 style={styles.title}>🔍 Verify Logo Authenticity</h1>
      <p style={styles.subtitle}>
        Check if any logo file is the real official ALU logo. No wallet needed — this is completely free.
      </p>

      {/* tab switcher - file upload vs manual hash */}
      <div style={styles.tabs}>
        <button
          onClick={() => { setActiveTab("file"); setResult(null); setError(""); }}
          style={activeTab === "file" ? styles.activeTab : styles.tab}
        >
          📁 Upload File
        </button>
        <button
          onClick={() => { setActiveTab("hash"); setResult(null); setError(""); }}
          style={activeTab === "hash" ? styles.activeTab : styles.tab}
        >
          #️⃣ Paste Hash
        </button>
      </div>

      <div className="card">

        {/* file upload tab */}
        {activeTab === "file" && (
          <div>
            <label style={styles.label}>Upload Logo File to Verify</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.fileInput}
            />

            {preview && (
              <div style={{ marginTop: 14 }}>
                <img src={preview} alt="preview" style={styles.preview} />
              </div>
            )}

            {hashing && (
              <div className="loading-msg">⏳ Computing SHA-256 hash...</div>
            )}

            {fileHash && !hashing && (
              <div style={{ marginTop: 14 }}>
                <label style={styles.label}>Computed Hash</label>
                <div style={styles.hashBox}>{fileHash}</div>
              </div>
            )}
          </div>
        )}

        {/* manual hash tab */}
        {activeTab === "hash" && (
          <div>
            <label style={styles.label}>Paste SHA-256 Hash</label>
            <input
              type="text"
              placeholder="0x10c50a139c35cc94ef6bd716e43ddddb199eb1a0b844f5854bad3c30655c4ccc"
              value={manualHash}
              onChange={(e) => setManualHash(e.target.value)}
            />
            <p style={styles.hint}>
              Paste a bytes32 hash starting with 0x
            </p>
          </div>
        )}

        {/* token ID input */}
        <div style={{ marginTop: 20 }}>
          <label style={styles.label}>Token ID to verify against</label>
          <input
            type="number"
            min="1"
            placeholder="1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            style={{ maxWidth: 120 }}
          />
          <p style={styles.hint}>
            The official ALU logo is registered as Token ID 1
          </p>
        </div>

        {/* verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || (activeTab === "file" ? !fileHash : !manualHash)}
          style={styles.verifyBtn}
        >
          {loading ? "⏳ Verifying on blockchain..." : "🔍 Verify Now"}
        </button>

        {error && <div className="error-msg">{error}</div>}

        {/* verification result - big clear visual */}
        {result && (
          <div style={result.isAuthentic ? styles.successResult : styles.failResult}>
            <div style={styles.resultIcon}>
              {result.isAuthentic ? "✅" : "❌"}
            </div>
            <div style={styles.resultTitle}>
              {result.isAuthentic
                ? "Logo Verified: This is the authentic ALU logo"
                : "Warning: This logo has been modified or is not authentic"}
            </div>
            <div style={styles.resultMsg}>{result.message}</div>

            {/* show metadata if authentic */}
            {result.isAuthentic && metadata && (
              <div style={styles.metaBox}>
                <div style={styles.metaRow}>
                  <span style={styles.metaKey}>Asset Name</span>
                  <span style={styles.metaVal}>{metadata.assetName}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaKey}>File Type</span>
                  <span style={styles.metaVal}>{metadata.fileType}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaKey}>Registered By</span>
                  <span
                    style={{
                      ...styles.metaVal,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {metadata.registeredBy}
                  </span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaKey}>Registration Date</span>
                  <span style={styles.metaVal}>{formatDate(metadata.timestamp)}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* info card */}
      <div className="card" style={{ background: "#f8fafc" }}>
        <h3 style={{ marginBottom: 10 }}>ℹ️ Why trust this verification?</h3>
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
          The verification result comes directly from the Ethereum blockchain — not from our server.
          The ALU logo hash was registered permanently on Sepolia testnet and cannot be altered by anyone.
          Even if this website goes down, the record still exist on blockchain forever.
          Anyone can independently verify by checking the contract on Etherscan.
        </p>
      </div>

    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" },
  subtitle: { color: "#64748b", marginBottom: 24, fontSize: 14 },
  tabs: { display: "flex", gap: 10, marginBottom: 20 },
  tab: {
    padding: "10px 20px",
    background: "white",
    color: "#64748b",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
  },
  activeTab: {
    padding: "10px 20px",
    background: "#4f46e5",
    color: "white",
    border: "2px solid #4f46e5",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 13,
    color: "#374151",
  },
  fileInput: {
    width: "100%",
    padding: "10px",
    border: "2px dashed #cbd5e0",
    borderRadius: 8,
    background: "#f8fafc",
    cursor: "pointer",
  },
  preview: {
    maxWidth: 180,
    maxHeight: 180,
    borderRadius: 8,
    border: "2px solid #e2e8f0",
  },
  hashBox: {
    background: "#1a1a2e",
    color: "#a5b4fc",
    padding: "12px 16px",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 11,
    wordBreak: "break-all",
  },
  hint: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  verifyBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #059669, #047857)",
    color: "white",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    marginTop: 20,
  },
  successResult: {
    marginTop: 24,
    background: "#d1fae5",
    border: "2px solid #6ee7b7",
    borderRadius: 14,
    padding: 24,
    textAlign: "center",
  },
  failResult: {
    marginTop: 24,
    background: "#fee2e2",
    border: "2px solid #fca5a5",
    borderRadius: 14,
    padding: 24,
    textAlign: "center",
  },
  resultIcon: { fontSize: 48, marginBottom: 10 },
  resultTitle: { fontSize: 17, fontWeight: 700, marginBottom: 6 },
  resultMsg: { fontSize: 13, opacity: 0.8 },
  metaBox: {
    marginTop: 20,
    background: "white",
    borderRadius: 10,
    padding: 16,
    textAlign: "left",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 13,
  },
  metaKey: { fontWeight: 600, color: "#374151" },
  metaVal: { color: "#64748b" },
};

export default Verify;
