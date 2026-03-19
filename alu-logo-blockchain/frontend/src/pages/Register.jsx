// Register page - allows users to upload a logo file,
// generate its SHA256 hash, and register it on blockchain as NFT

import { useState } from "react";
import { hashFile, getRegistryContract } from "../utils/contracts";

function Register({ wallet }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [hash, setHash] = useState("");
  const [assetName, setAssetName] = useState("");
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // this function runs when user pick a file
  // it show a preview and auto compute the SHA256 hash
  async function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setSuccess("");
    setError("");

    // auto fill the file type from the file extension
    const ext = selected.name.split(".").pop().toUpperCase();
    setFileType(ext);

    // show image preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selected);

    // compute SHA256 hash in the browser - no server needed
    setHashing(true);
    try {
      const computed = await hashFile(selected);
      setHash(computed);
    } catch (err) {
      setError("Failed to hash file: " + err.message);
    }
    setHashing(false);
  }

  // this function submit the registration to the blockchain
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!wallet) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!hash) {
      setError("Please upload a file first.");
      return;
    }
    if (!assetName.trim()) {
      setError("Please enter an asset name.");
      return;
    }

    setLoading(true);
    try {
      // get the contract instance connected to user wallet signer
      const contract = getRegistryContract(wallet.signer);

      // call registerAsset on the blockchain
      // this will prompt MetaMask to ask user to approve the transaction
      const tx = await contract.registerAsset(assetName, fileType, hash);

      // wait for the transaction to be mined on the blockchain
      const receipt = await tx.wait();

      // find the AssetRegistered event to get the token ID
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === "AssetRegistered";
        } catch { return false; }
      });

      let tokenId = "unknown";
      if (event) {
        const parsed = contract.interface.parseLog(event);
        tokenId = parsed.args[0].toString();
      }

      setSuccess(`✅ Asset registered successfully! Token ID: ${tokenId}. Transaction: ${tx.hash}`);
    } catch (err) {
      if (err.message.includes("already registered")) {
        setError("❌ This file has already been registered on the blockchain.");
      } else if (err.message.includes("user rejected")) {
        setError("❌ You rejected the transaction in MetaMask.");
      } else {
        setError("❌ Error: " + err.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="page">
      <h1 style={styles.title}>📝 Register a Digital Asset</h1>
      <p style={styles.subtitle}>
        Upload a logo file to generate its SHA-256 hash and register it permanently on the Ethereum blockchain.
      </p>

      {!wallet && (
        <div className="error-msg">
          ⚠️ You need to connect your wallet before registering an asset.
        </div>
      )}

      <div className="card">
        <form onSubmit={handleRegister}>

          {/* file upload section */}
          <div style={styles.section}>
            <label style={styles.label}>Upload Logo File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </div>

          {/* image preview */}
          {preview && (
            <div style={styles.section}>
              <label style={styles.label}>Preview</label>
              <img src={preview} alt="preview" style={styles.preview} />
            </div>
          )}

          {/* hash display */}
          {hashing && (
            <div className="loading-msg">⏳ Computing SHA-256 hash in browser...</div>
          )}
          {hash && !hashing && (
            <div style={styles.section}>
              <label style={styles.label}>SHA-256 Hash (bytes32)</label>
              <div style={styles.hashBox}>{hash}</div>
              <p style={styles.hint}>
                This fingerprint uniquely identifies your file. It was computed locally in your browser.
              </p>
            </div>
          )}

          {/* asset name input */}
          <div style={styles.section}>
            <label style={styles.label}>Asset Name</label>
            <input
              type="text"
              placeholder="e.g. ALU Official Logo 2025"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>

          {/* file type - auto filled */}
          <div style={styles.section}>
            <label style={styles.label}>File Type</label>
            <input
              type="text"
              placeholder="e.g. PNG"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            />
          </div>

          {/* submit button */}
          <button
            type="submit"
            disabled={loading || !wallet || !hash}
            style={styles.submitBtn}
          >
            {loading ? "⏳ Registering on blockchain..." : "🔗 Register Asset"}
          </button>

        </form>

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}
      </div>

      {/* info box */}
      <div className="card" style={{ background: "#f8fafc" }}>
        <h3 style={{ marginBottom: 10 }}>ℹ️ What happens when you register?</h3>
        <ul style={styles.infoList}>
          <li>Your file is hashed in the browser — it never leaves your computer</li>
          <li>MetaMask will ask you to approve and sign the transaction</li>
          <li>The hash is stored permanently on the Ethereum blockchain</li>
          <li>You receive an NFT token as proof of registration</li>
          <li>Nobody can register the same file again after this</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" },
  subtitle: { color: "#64748b", marginBottom: 24, fontSize: 14 },
  section: { marginBottom: 20 },
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
    maxWidth: 200,
    maxHeight: 200,
    borderRadius: 8,
    border: "2px solid #e2e8f0",
    marginTop: 8,
  },
  hashBox: {
    background: "#1a1a2e",
    color: "#a5b4fc",
    padding: "12px 16px",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 12,
    wordBreak: "break-all",
    marginTop: 6,
  },
  hint: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "white",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    marginTop: 8,
  },
  infoList: {
    paddingLeft: 20,
    color: "#475569",
    fontSize: 13,
    lineHeight: 2,
  },
};

export default Register;
