import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { BetSlipSelection } from "../App";
import { usePlaceBet } from "../hooks/useQueries";

interface BetSlipProps {
  betSlip: Map<string, BetSlipSelection>;
  onRemove: (eventId: string) => void;
  onClear: () => void;
}

export default function BetSlip({ betSlip, onRemove, onClear }: BetSlipProps) {
  const [stake, setStake] = useState<string>("100");
  const { mutateAsync: placeBet, isPending } = usePlaceBet();

  const selections = Array.from(betSlip.values());
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const stakeNum = Number.parseFloat(stake) || 0;
  const estimatedWin = stakeNum * totalOdds;

  const handlePlaceBet = async () => {
    if (selections.length === 0) return;
    if (stakeNum <= 0) {
      toast.error("Please enter a valid stake");
      return;
    }
    try {
      for (const sel of selections) {
        await placeBet({
          eventId: sel.eventId,
          prediction: sel.prediction,
          stake: BigInt(Math.floor(stakeNum)),
        });
      }
      toast.success("Bet placed successfully!");
      onClear();
      setStake("100");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to place bet");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Bet Slip
        </h3>
        {selections.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive transition-colors"
            data-ocid="betslip.clear.button"
            aria-label="Clear bet slip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {selections.length === 0 ? (
        <div className="px-4 py-8 text-center" data-ocid="betslip.empty_state">
          <p className="text-xs text-muted-foreground">
            Click odds to add selections
          </p>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <AnimatePresence initial={false}>
            {selections.map((sel) => (
              <motion.div
                key={sel.eventId.toString()}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                data-ocid={`betslip.item.${Array.from(betSlip.keys()).indexOf(sel.eventId.toString()) + 1}`}
                className="flex items-start justify-between gap-2 p-2.5 rounded-md bg-secondary border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground truncate">
                    {sel.homeTeam} vs {sel.awayTeam}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-foreground capitalize">
                      {sel.prediction}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {sel.odds.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(sel.eventId.toString())}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                  data-ocid="betslip.remove.button"
                  aria-label="Remove selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Odds</span>
              <span className="font-bold text-primary">
                {totalOdds.toFixed(2)}
              </span>
            </div>
            <div>
              <Label
                htmlFor="stake-input"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Stake (credits)
              </Label>
              <Input
                id="stake-input"
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                min="1"
                className="h-8 text-sm bg-secondary border-border"
                data-ocid="betslip.stake.input"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. Winnings</span>
              <span className="font-bold text-success">
                {estimatedWin.toFixed(0)} credits
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-bold text-sm"
            onClick={handlePlaceBet}
            disabled={isPending}
            data-ocid="betslip.place_bet.button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing...
              </>
            ) : (
              `Place Bet · ${stakeNum} credits`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
