import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BetView, SportsEventView } from "../backend";
import { useActor } from "./useActor";

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<SportsEventView[]>({
    queryKey: ["events"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserBets() {
  const { actor, isFetching } = useActor();
  return useQuery<BetView[]>({
    queryKey: ["userBets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOpenBets() {
  const { actor, isFetching } = useActor();
  return useQuery<BetView[]>({
    queryKey: ["openBets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOpenBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceBet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      prediction,
      stake,
    }: { eventId: bigint; prediction: string; stake: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeBet(eventId, prediction, stake);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userBets"] });
      queryClient.invalidateQueries({ queryKey: ["openBets"] });
    },
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: {
      startTime: bigint;
      homeTeam: string;
      oddsAway: number;
      oddsDraw: number;
      oddsHome: number;
      sport: string;
      awayTeam: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEventStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      status,
    }: { eventId: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEventStatus(eventId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSettleEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      homeScore,
      awayScore,
    }: { eventId: bigint; homeScore: bigint; awayScore: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.settleEvent(eventId, homeScore, awayScore);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["userBets"] });
      queryClient.invalidateQueries({ queryKey: ["openBets"] });
    },
  });
}
