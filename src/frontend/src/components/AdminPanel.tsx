import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EventStatus } from "../backend";
import {
  useCreateEvent,
  useGetAllEvents,
  useSettleEvent,
  useUpdateEventStatus,
} from "../hooks/useQueries";

const SPORTS = ["Soccer", "Basketball", "Tennis", "Ice Hockey", "eSports"];

export default function AdminPanel() {
  const { data: events, isLoading } = useGetAllEvents();
  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateEventStatus();
  const { mutateAsync: settleEvent, isPending: isSettling } = useSettleEvent();

  const [form, setForm] = useState({
    sport: "Soccer",
    homeTeam: "",
    awayTeam: "",
    oddsHome: "2.10",
    oddsDraw: "3.20",
    oddsAway: "3.50",
  });

  const [settleForm, setSettleForm] = useState<
    Record<string, { home: string; away: string }>
  >({});

  const handleCreate = async () => {
    if (!form.homeTeam.trim() || !form.awayTeam.trim()) {
      toast.error("Please fill in both team names");
      return;
    }
    try {
      await createEvent({
        sport: form.sport,
        homeTeam: form.homeTeam.trim(),
        awayTeam: form.awayTeam.trim(),
        oddsHome: Number.parseFloat(form.oddsHome),
        oddsDraw: Number.parseFloat(form.oddsDraw),
        oddsAway: Number.parseFloat(form.oddsAway),
        startTime: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Event created!");
      setForm((f) => ({ ...f, homeTeam: "", awayTeam: "" }));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create event");
    }
  };

  const handleStatusUpdate = async (eventId: bigint, status: string) => {
    try {
      await updateStatus({ eventId, status });
      toast.success(`Event status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status");
    }
  };

  const handleSettle = async (eventId: bigint) => {
    const key = eventId.toString();
    const scores = settleForm[key];
    if (!scores || scores.home === "" || scores.away === "") {
      toast.error("Please enter scores for both teams");
      return;
    }
    try {
      await settleEvent({
        eventId,
        homeScore: BigInt(Number.parseInt(scores.home)),
        awayScore: BigInt(Number.parseInt(scores.away)),
      });
      toast.success("Event settled!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to settle event");
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">
          Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage events and settle bets
        </p>
      </div>

      {/* Create Event */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-5 shadow-card"
        data-ocid="admin.create_event.panel"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
          Create New Event
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1">Sport</Label>
            <Select
              value={form.sport}
              onValueChange={(v) => setForm((f) => ({ ...f, sport: v }))}
            >
              <SelectTrigger
                className="bg-secondary border-border"
                data-ocid="admin.sport.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SPORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              Home Team
            </Label>
            <Input
              value={form.homeTeam}
              onChange={(e) =>
                setForm((f) => ({ ...f, homeTeam: e.target.value }))
              }
              placeholder="e.g. Real Madrid"
              className="bg-secondary border-border"
              data-ocid="admin.home_team.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              Away Team
            </Label>
            <Input
              value={form.awayTeam}
              onChange={(e) =>
                setForm((f) => ({ ...f, awayTeam: e.target.value }))
              }
              placeholder="e.g. Barcelona"
              className="bg-secondary border-border"
              data-ocid="admin.away_team.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              Odds Home
            </Label>
            <Input
              type="number"
              step="0.01"
              value={form.oddsHome}
              onChange={(e) =>
                setForm((f) => ({ ...f, oddsHome: e.target.value }))
              }
              className="bg-secondary border-border"
              data-ocid="admin.odds_home.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              Odds Draw
            </Label>
            <Input
              type="number"
              step="0.01"
              value={form.oddsDraw}
              onChange={(e) =>
                setForm((f) => ({ ...f, oddsDraw: e.target.value }))
              }
              className="bg-secondary border-border"
              data-ocid="admin.odds_draw.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              Odds Away
            </Label>
            <Input
              type="number"
              step="0.01"
              value={form.oddsAway}
              onChange={(e) =>
                setForm((f) => ({ ...f, oddsAway: e.target.value }))
              }
              className="bg-secondary border-border"
              data-ocid="admin.odds_away.input"
            />
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold"
          data-ocid="admin.create_event.button"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </>
          )}
        </Button>
      </motion.div>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border overflow-hidden shadow-card"
        data-ocid="admin.events.table"
      >
        <div className="px-4 py-3 border-b border-border bg-secondary">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
            All Events
          </h2>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Loading events...
          </div>
        ) : !events || events.length === 0 ? (
          <div
            className="p-10 text-center"
            data-ocid="admin.events.empty_state"
          >
            <p className="text-muted-foreground">
              No events yet. Create one above.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary hover:bg-secondary">
                <TableHead className="text-muted-foreground text-xs uppercase">
                  ID
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Match
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Sport
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Actions
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Settle
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, i) => {
                const key = event.id.toString();
                const scores = settleForm[key] ?? { home: "", away: "" };
                return (
                  <TableRow
                    key={key}
                    data-ocid={`admin.events.item.${i + 1}`}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      #{key}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {event.homeTeam} vs {event.awayTeam}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.sport}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold capitalize ${
                          event.status === EventStatus.live
                            ? "text-primary"
                            : event.status === EventStatus.settled
                              ? "text-muted-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {event.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {event.status === EventStatus.upcoming && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(event.id, "live")}
                            disabled={isUpdating}
                            className="text-xs h-7 border-primary/50 text-primary hover:bg-primary/10"
                            data-ocid={`admin.set_live.button.${i + 1}`}
                          >
                            Set Live
                          </Button>
                        )}
                        {event.status === EventStatus.live && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusUpdate(event.id, "upcoming")
                            }
                            disabled={isUpdating}
                            className="text-xs h-7 border-border text-muted-foreground"
                            data-ocid={`admin.set_upcoming.button.${i + 1}`}
                          >
                            Set Upcoming
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.status !== EventStatus.settled && (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min="0"
                            placeholder="H"
                            value={scores.home}
                            onChange={(e) =>
                              setSettleForm((f) => ({
                                ...f,
                                [key]: { ...scores, home: e.target.value },
                              }))
                            }
                            className="w-12 h-7 text-xs bg-secondary border-border"
                            data-ocid={`admin.home_score.input.${i + 1}`}
                          />
                          <span className="text-muted-foreground text-xs">
                            :
                          </span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="A"
                            value={scores.away}
                            onChange={(e) =>
                              setSettleForm((f) => ({
                                ...f,
                                [key]: { ...scores, away: e.target.value },
                              }))
                            }
                            className="w-12 h-7 text-xs bg-secondary border-border"
                            data-ocid={`admin.away_score.input.${i + 1}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSettle(event.id)}
                            disabled={isSettling}
                            className="h-7 text-xs bg-primary/80 hover:bg-primary text-primary-foreground"
                            data-ocid={`admin.settle.button.${i + 1}`}
                          >
                            {isSettling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                      {event.status === EventStatus.settled && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="w-3 h-3" />
                          {Number(event.homeScore)} : {Number(event.awayScore)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </section>
  );
}
