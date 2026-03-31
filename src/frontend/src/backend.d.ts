import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface BetView {
    eventId: bigint;
    result: BetResult;
    prediction: EventResult;
    odds: number;
    user: Principal;
    stake: bigint;
    payout: bigint;
}
export interface SportsEventView {
    id: bigint;
    startTime: Time;
    status: EventStatus;
    result: EventResult;
    homeTeam: string;
    oddsAway: number;
    oddsDraw: number;
    oddsHome: number;
    sport: string;
    homeScore: bigint;
    awayTeam: string;
    awayScore: bigint;
}
export interface UserProfile {
    name: string;
}
export enum BetResult {
    won = "won",
    pending = "pending",
    lost = "lost"
}
export enum EventResult {
    pending = "pending",
    away = "away",
    draw = "draw",
    home = "home"
}
export enum EventStatus {
    upcoming = "upcoming",
    settled = "settled",
    live = "live"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(event: {
        startTime: Time;
        homeTeam: string;
        oddsAway: number;
        oddsDraw: number;
        oddsHome: number;
        sport: string;
        awayTeam: string;
    }): Promise<bigint>;
    getAllEvents(): Promise<Array<SportsEventView>>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEventsBySport(sport: string): Promise<Array<SportsEventView>>;
    getOpenBets(): Promise<Array<BetView>>;
    getUserBets(): Promise<Array<BetView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeBet(eventId: bigint, prediction: string, stake: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    settleEvent(eventId: bigint, homeScore: bigint, awayScore: bigint): Promise<void>;
    updateEventStatus(eventId: bigint, status: string): Promise<void>;
}
