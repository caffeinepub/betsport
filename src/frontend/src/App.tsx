import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import BetHistory from "./components/BetHistory";
import BetSlip from "./components/BetSlip";
import EventList from "./components/EventList";
import Header from "./components/Header";
import OpenBets from "./components/OpenBets";
import Sidebar from "./components/Sidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";

export type BetSlipSelection = {
  eventId: bigint;
  homeTeam: string;
  awayTeam: string;
  prediction: "home" | "draw" | "away";
  odds: number;
};

export type ActiveTab = "sports" | "history" | "admin";

export default function App() {
  const [betSlip, setBetSlip] = useState<Map<string, BetSlipSelection>>(
    new Map(),
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<ActiveTab>("sports");
  const { data: isAdmin } = useIsAdmin();
  const { identity } = useInternetIdentity();

  const addToBetSlip = (selection: BetSlipSelection) => {
    setBetSlip((prev) => {
      const next = new Map(prev);
      const key = selection.eventId.toString();
      // Toggle off if same selection
      const existing = next.get(key);
      if (existing && existing.prediction === selection.prediction) {
        next.delete(key);
      } else {
        next.set(key, selection);
      }
      return next;
    });
  };

  const removeFromBetSlip = (eventId: string) => {
    setBetSlip((prev) => {
      const next = new Map(prev);
      next.delete(eventId);
      return next;
    });
  };

  const clearBetSlip = () => setBetSlip(new Map());

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin ?? false}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          {activeTab === "sports" && (
            <EventList
              activeCategory={activeCategory}
              betSlip={betSlip}
              onAddToBetSlip={addToBetSlip}
              isLoggedIn={!!identity}
            />
          )}
          {activeTab === "history" && <BetHistory />}
          {activeTab === "admin" && isAdmin && <AdminPanel />}
          {activeTab === "admin" && !isAdmin && (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Access denied. Admin only.
              </p>
            </div>
          )}
          <footer className="mt-12 py-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
        {activeTab === "sports" && identity && (
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 p-4 gap-4 overflow-y-auto scrollbar-thin border-l border-border">
            <BetSlip
              betSlip={betSlip}
              onRemove={removeFromBetSlip}
              onClear={clearBetSlip}
            />
            <OpenBets />
          </aside>
        )}
      </div>
      <Toaster theme="dark" />
    </div>
  );
}
