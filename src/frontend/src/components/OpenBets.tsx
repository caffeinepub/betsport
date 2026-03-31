import { Skeleton } from "@/components/ui/skeleton";
import { useGetOpenBets } from "../hooks/useQueries";

const predictionLabel: Record<string, string> = {
  home: "Home Win",
  away: "Away Win",
  draw: "Draw",
  pending: "Pending",
};

export default function OpenBets() {
  const { data: openBets, isLoading } = useGetOpenBets();

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Open Bets
        </h3>
      </div>
      <div className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-secondary" />
            <Skeleton className="h-10 w-full bg-secondary" />
          </div>
        ) : !openBets || openBets.length === 0 ? (
          <div className="py-6 text-center" data-ocid="openbets.empty_state">
            <p className="text-xs text-muted-foreground">No open bets</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openBets.map((bet, i) => (
              <div
                key={`${bet.eventId.toString()}-${bet.prediction}-${i}`}
                data-ocid={`openbets.item.${i + 1}`}
                className="flex items-center justify-between p-2.5 rounded-md bg-secondary border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    Event #{bet.eventId.toString()}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {predictionLabel[bet.prediction] ?? bet.prediction}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-primary">
                    {bet.odds.toFixed(2)}x
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {Number(bet.stake)} cr
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
