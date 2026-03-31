import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import type { BetSlipSelection } from "../App";
import type { SportsEventView } from "../backend";
import { EventStatus } from "../backend";
import { useGetAllEvents } from "../hooks/useQueries";

const SPORTS_EMOJIS: Record<string, string> = {
  Soccer: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  "Ice Hockey": "🏒",
  eSports: "🎮",
};

interface EventListProps {
  activeCategory: string;
  betSlip: Map<string, BetSlipSelection>;
  onAddToBetSlip: (s: BetSlipSelection) => void;
  isLoggedIn: boolean;
}

function OddsChip({
  label,
  value,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`odds-chip flex flex-col items-center justify-center px-3 py-1.5 rounded-md border text-xs font-semibold transition-all min-w-[64px] ${
        selected
          ? "border-primary bg-primary/15 text-primary shadow-glow"
          : disabled
            ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60"
            : "border-border bg-secondary hover:border-primary/60 text-foreground cursor-pointer"
      }`}
      data-ocid={`event.${label.toLowerCase()}.toggle`}
    >
      <span className="text-[10px] text-muted-foreground font-normal">
        {label}
      </span>
      <span className="text-sm">{value.toFixed(2)}</span>
    </button>
  );
}

function EventRow({
  event,
  selection,
  onSelect,
  isLoggedIn,
  index,
}: {
  event: SportsEventView;
  selection?: BetSlipSelection;
  onSelect: (s: BetSlipSelection) => void;
  isLoggedIn: boolean;
  index: number;
}) {
  const isLive = event.status === EventStatus.live;
  const isSettled = event.status === EventStatus.settled;
  const startDate = new Date(Number(event.startTime) / 1_000_000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`events.item.${index + 1}`}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:border-border/80 transition-colors ${
        isSettled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <span className="text-xl flex-shrink-0">
          {SPORTS_EMOJIS[event.sport] ?? "🏆"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Live
              </span>
            )}
            {!isLive && !isSettled && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatDistanceToNow(startDate, { addSuffix: true })}
              </span>
            )}
            {isSettled && (
              <Badge
                variant="outline"
                className="text-[10px] border-border text-muted-foreground"
              >
                Settled
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {event.sport}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
            {event.homeTeam}{" "}
            <span className="text-muted-foreground font-normal">vs</span>{" "}
            {event.awayTeam}
          </p>
          {isLive && (
            <p className="text-xs text-muted-foreground">
              {Number(event.homeScore)} – {Number(event.awayScore)}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <OddsChip
          label="Home"
          value={event.oddsHome}
          selected={selection?.prediction === "home"}
          onClick={() =>
            onSelect({
              eventId: event.id,
              homeTeam: event.homeTeam,
              awayTeam: event.awayTeam,
              prediction: "home",
              odds: event.oddsHome,
            })
          }
          disabled={!isLoggedIn || isSettled}
        />
        <OddsChip
          label="Draw"
          value={event.oddsDraw}
          selected={selection?.prediction === "draw"}
          onClick={() =>
            onSelect({
              eventId: event.id,
              homeTeam: event.homeTeam,
              awayTeam: event.awayTeam,
              prediction: "draw",
              odds: event.oddsDraw,
            })
          }
          disabled={!isLoggedIn || isSettled}
        />
        <OddsChip
          label="Away"
          value={event.oddsAway}
          selected={selection?.prediction === "away"}
          onClick={() =>
            onSelect({
              eventId: event.id,
              homeTeam: event.homeTeam,
              awayTeam: event.awayTeam,
              prediction: "away",
              odds: event.oddsAway,
            })
          }
          disabled={!isLoggedIn || isSettled}
        />
      </div>
    </motion.div>
  );
}

export default function EventList({
  activeCategory,
  betSlip,
  onAddToBetSlip,
  isLoggedIn,
}: EventListProps) {
  const { data: events, isLoading } = useGetAllEvents();

  const filtered =
    events?.filter(
      (e) => activeCategory === "All" || e.sport === activeCategory,
    ) ?? [];

  const liveEvents = filtered.filter((e) => e.status === EventStatus.live);
  const upcomingEvents = filtered.filter(
    (e) => e.status === EventStatus.upcoming,
  );
  const settledEvents = filtered.filter(
    (e) => e.status === EventStatus.settled,
  );

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">
          Live Sports
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading events..."
            : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} available`}
        </p>
        {!isLoggedIn && (
          <p className="text-xs text-primary/80 mt-1">
            Login to place bets on events
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="events.empty_state"
        >
          <span className="text-5xl mb-4">🏆</span>
          <p className="text-muted-foreground font-medium">
            No events available
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {activeCategory !== "All"
              ? `No ${activeCategory} events found.`
              : "An admin can create events from the Admin panel."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {liveEvents.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  Live Now
                </h2>
                <div className="space-y-2">
                  {liveEvents.map((event, i) => (
                    <EventRow
                      key={event.id.toString()}
                      event={event}
                      selection={betSlip.get(event.id.toString())}
                      onSelect={onAddToBetSlip}
                      isLoggedIn={isLoggedIn}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Upcoming
                </h2>
                <div className="space-y-2">
                  {upcomingEvents.map((event, i) => (
                    <EventRow
                      key={event.id.toString()}
                      event={event}
                      selection={betSlip.get(event.id.toString())}
                      onSelect={onAddToBetSlip}
                      isLoggedIn={isLoggedIn}
                      index={liveEvents.length + i}
                    />
                  ))}
                </div>
              </div>
            )}
            {settledEvents.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Settled
                </h2>
                <div className="space-y-2">
                  {settledEvents.map((event, i) => (
                    <EventRow
                      key={event.id.toString()}
                      event={event}
                      selection={betSlip.get(event.id.toString())}
                      onSelect={onAddToBetSlip}
                      isLoggedIn={isLoggedIn}
                      index={liveEvents.length + upcomingEvents.length + i}
                    />
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
