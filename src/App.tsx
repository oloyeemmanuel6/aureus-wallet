import { Navigate, Route, Routes } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import { AppShell } from "./components/AppShell";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Unlock } from "./pages/Unlock";
import { Dashboard } from "./pages/Dashboard";
import { Send } from "./pages/Send";
import { Receive } from "./pages/Receive";
import { UtxoLab } from "./pages/UtxoLab";
import { Vaults } from "./pages/Vaults";
import { PsbtLab } from "./pages/PsbtLab";
import { Settings } from "./pages/Settings";

function Guard({ children }: { children: React.ReactNode }) {
  const { state, loading } = useWallet();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aureus-black text-aureus-gold">
        Loading Aureus…
      </div>
    );
  }
  if (!state?.hasWallet) return <Navigate to="/onboarding" replace />;
  if (!state.unlocked) return <Navigate to="/unlock" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/unlock" element={<Unlock />} />
        <Route
          path="/app"
          element={
            <Guard>
              <AppShell />
            </Guard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="send" element={<Send />} />
          <Route path="receive" element={<Receive />} />
          <Route path="utxos" element={<UtxoLab />} />
          <Route path="vaults" element={<Vaults />} />
          <Route path="psbt" element={<PsbtLab />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WalletProvider>
  );
}
