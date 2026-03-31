import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  LogIn,
  LogOut,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import type { ActiveTab } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetBalance } from "../hooks/useQueries";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
}

export default function Header({
  activeTab,
  setActiveTab,
  isAdmin,
}: HeaderProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: balance } = useGetBalance();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;
  const balanceDisplay =
    balance !== undefined ? Number(balance).toLocaleString() : "—";

  const navLinks: { label: string; tab: ActiveTab }[] = [
    { label: "Live Betting", tab: "sports" },
    { label: "My Bets", tab: "history" },
    ...(isAdmin ? [{ label: "Admin", tab: "admin" as ActiveTab }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 h-14 border-b border-border bg-card/95 backdrop-blur-sm shadow-card">
      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-glow">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          Bet<span className="text-primary">Sport</span>
        </span>
      </div>

      {/* Nav */}
      <nav
        className="hidden md:flex items-center gap-1 ml-6"
        aria-label="Main navigation"
      >
        {navLinks.map(({ label, tab }) => (
          <button
            key={tab}
            type="button"
            data-ocid={`nav.${tab}.link`}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Button>

        {identity ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {balanceDisplay}
              </span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground hover:text-foreground"
                  data-ocid="header.user.button"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {shortPrincipal?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs">
                    {shortPrincipal}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem
                  onClick={() => clear()}
                  data-ocid="header.logout.button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              size="sm"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="header.login.button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
