import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "motion/react";
import { BetResult } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserBets } from "../hooks/useQueries";

const predictionLabel: Record<string, string> = {
  home: "Home Win",
  away: "Away Win",
  draw: "Draw",
  pending: "Pending",
};

function ResultBadge({ result }: { result: BetResult }) {
  if (result === BetResult.won) {
    return (
      <Badge className="bg-[oklch(0.15_0.04_142)] text-[oklch(0.72_0.17_142)] border-[oklch(0.3_0.06_142)] hover:bg-[oklch(0.15_0.04_142)] text-xs">
        Won
      </Badge>
    );
  }
  if (result === BetResult.lost) {
    return (
      <Badge className="bg-[oklch(0.18_0.05_27)] text-[oklch(0.63_0.23_27)] border-[oklch(0.3_0.07_27)] hover:bg-[oklch(0.18_0.05_27)] text-xs">
        Lost
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-muted-foreground border-border text-xs"
    >
      Pending
    </Badge>
  );
}

export default function BetHistory() {
  const { data: bets, isLoading } = useGetUserBets();
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <p className="text-muted-foreground font-medium">
          Login to view your bet history
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">
          My Bet History
        </h1>
        <p className="text-sm text-muted-foreground">
          {bets
            ? `${bets.length} total bet${bets.length !== 1 ? "s" : ""}`
            : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-card" />
          ))}
        </div>
      ) : !bets || bets.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="history.empty_state"
        >
          <span className="text-5xl mb-4">📋</span>
          <p className="text-muted-foreground font-medium">No bets yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Place your first bet on the Live Sports tab
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border overflow-hidden shadow-card"
          data-ocid="history.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary hover:bg-secondary">
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Event
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Prediction
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Odds
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Stake
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Payout
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map((bet, i) => (
                <TableRow
                  key={`${bet.eventId.toString()}-${bet.prediction}-${i}`}
                  data-ocid={`history.item.${i + 1}`}
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="text-sm font-medium">
                    Event #{bet.eventId.toString()}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {predictionLabel[bet.prediction] ?? bet.prediction}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-primary">
                    {bet.odds.toFixed(2)}x
                  </TableCell>
                  <TableCell className="text-sm">
                    {Number(bet.stake).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {bet.result === BetResult.won ? (
                      <span className="text-success font-semibold">
                        +{Number(bet.payout).toLocaleString()}
                      </span>
                    ) : bet.result === BetResult.lost ? (
                      <span className="text-destructive">—</span>
                    ) : (
                      <span className="text-muted-foreground">
                        ~{(Number(bet.stake) * bet.odds).toFixed(0)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ResultBadge result={bet.result} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </section>
  );
}
