import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";

function App() {
  const [wallet, setWallet] = useState(null);

  return (
    <BrowserRouter>
      <Navbar wallet={wallet} setWallet={setWallet} />

      {wallet && !wallet.isCorrectNetwork && (
        <div style={{
          background: "#fef3c7",
          color: "#92400e",
          textAlign: "center",
          padding: "10px",
          fontWeight: 600,
          fontSize: 14
        }}>
          ⚠️ Wrong network! Please switch MetaMask to Sepolia Testnet.
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home wallet={wallet} />} />
        <Route path="/register" element={<Register wallet={wallet} />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard" element={<Dashboard wallet={wallet} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;