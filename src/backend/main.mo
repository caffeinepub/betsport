import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type EventStatus = {
    #upcoming;
    #live;
    #settled;
  };

  type BetResult = {
    #pending;
    #won;
    #lost;
  };

  type EventResult = {
    #home;
    #draw;
    #away;
    #pending;
  };

  type UserWallet = {
    var balance : Nat;
  };

  type SportsEvent = {
    id : Nat;
    sport : Text;
    homeTeam : Text;
    awayTeam : Text;
    oddsHome : Float;
    oddsDraw : Float;
    oddsAway : Float;
    startTime : Time.Time;
    status : EventStatus;
    var homeScore : Nat;
    var awayScore : Nat;
    result : EventResult;
  };

  type SportsEventView = {
    id : Nat;
    sport : Text;
    homeTeam : Text;
    awayTeam : Text;
    oddsHome : Float;
    oddsDraw : Float;
    oddsAway : Float;
    startTime : Time.Time;
    status : EventStatus;
    homeScore : Nat;
    awayScore : Nat;
    result : EventResult;
  };

  type Bet = {
    user : Principal;
    eventId : Nat;
    prediction : EventResult;
    stake : Nat;
    odds : Float;
    var result : BetResult;
    var payout : Nat;
  };

  type BetView = {
    user : Principal;
    eventId : Nat;
    prediction : EventResult;
    stake : Nat;
    odds : Float;
    result : BetResult;
    payout : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  module SportsEvent {
    public func compare(event1 : SportsEvent, event2 : SportsEvent) : Order.Order {
      Nat.compare(event1.id, event2.id);
    };
  };

  module Bet {
    public func compare(bet1 : Bet, bet2 : Bet) : Order.Order {
      Nat.compare(bet1.stake, bet2.stake);
    };
    public func compareById(bet1 : Bet, bet2 : Bet) : Order.Order {
      Nat.compare(bet1.eventId, bet2.eventId);
    };
  };

  let wallets = Map.empty<Principal, UserWallet>();
  let events = Map.empty<Nat, SportsEvent>();
  let bets = Map.empty<Nat, Bet>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextEventId = 1;
  var nextBetId = 1;

  func getOrCreateWallet(user : Principal) : UserWallet {
    switch (wallets.get(user)) {
      case (?wallet) { wallet };
      case (null) {
        let newWallet : UserWallet = { var balance = 1000 };
        wallets.add(user, newWallet);
        newWallet;
      };
    };
  };

  func safeFloatToNat(value : Float) : Nat {
    if (value < 0) { 0 } else if (value > 100_000_000) { 100_000_000 } else {
      Int.abs(value.toInt());
    };
  };

  func sportsEventToView(event : SportsEvent) : SportsEventView {
    {
      id = event.id;
      sport = event.sport;
      homeTeam = event.homeTeam;
      awayTeam = event.awayTeam;
      oddsHome = event.oddsHome;
      oddsDraw = event.oddsDraw;
      oddsAway = event.oddsAway;
      startTime = event.startTime;
      status = event.status;
      homeScore = event.homeScore;
      awayScore = event.awayScore;
      result = event.result;
    };
  };

  func betToView(bet : Bet) : BetView {
    {
      user = bet.user;
      eventId = bet.eventId;
      prediction = bet.prediction;
      stake = bet.stake;
      odds = bet.odds;
      result = bet.result;
      payout = bet.payout;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getBalance() : async Nat {
    getOrCreateWallet(caller).balance;
  };

  public shared ({ caller }) func createEvent(event : {
    sport : Text;
    homeTeam : Text;
    awayTeam : Text;
    oddsHome : Float;
    oddsDraw : Float;
    oddsAway : Float;
    startTime : Time.Time;
  }) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create events");
    };
    let eventId = nextEventId;
    nextEventId += 1;
    let newEvent : SportsEvent = {
      event with
      id = eventId;
      status = #upcoming;
      var homeScore = 0;
      var awayScore = 0;
      result = #pending;
    };
    events.add(eventId, newEvent);
    eventId;
  };

  public shared ({ caller }) func placeBet(eventId : Nat, prediction : Text, stake : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place bets");
    };
    if (stake == 0) { Runtime.trap("Stake must be greater than zero") };
    let wallet = getOrCreateWallet(caller);
    if (wallet.balance < stake) { Runtime.trap("Insufficient balance") };

    let sportsEvent = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };

    if (sportsEvent.status == #settled) {
      Runtime.trap("Cannot bet on settled events");
    };

    let betPrediction = switch (prediction) {
      case ("home") { #home };
      case ("draw") { #draw };
      case ("away") { #away };
      case (_) { Runtime.trap("Invalid prediction") };
    };

    let odds = switch (betPrediction) {
      case (#home) { sportsEvent.oddsHome };
      case (#draw) { sportsEvent.oddsDraw };
      case (#away) { sportsEvent.oddsAway };
      case (_) { Runtime.trap("Invalid prediction") };
    };

    wallet.balance -= stake;

    let betId = nextBetId;
    nextBetId += 1;

    let newBet : Bet = {
      user = caller;
      eventId;
      prediction = betPrediction;
      stake;
      odds;
      var result = #pending;
      var payout = 0;
    };

    bets.add(betId, newBet);
    betId;
  };

  public shared ({ caller }) func updateEventStatus(eventId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update event status");
    };
    let sportsEvent = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };

    let newStatus = switch (status) {
      case ("live") { #live };
      case ("upcoming") { #upcoming };
      case (_) { Runtime.trap("Invalid status") };
    };

    let updatedEvent : SportsEvent = {
      id = sportsEvent.id;
      sport = sportsEvent.sport;
      homeTeam = sportsEvent.homeTeam;
      awayTeam = sportsEvent.awayTeam;
      oddsHome = sportsEvent.oddsHome;
      oddsDraw = sportsEvent.oddsDraw;
      oddsAway = sportsEvent.oddsAway;
      startTime = sportsEvent.startTime;
      status = newStatus;
      result = sportsEvent.result;
      var homeScore = sportsEvent.homeScore;
      var awayScore = sportsEvent.awayScore;
    };

    events.add(eventId, updatedEvent);
  };

  public shared ({ caller }) func settleEvent(eventId : Nat, homeScore : Nat, awayScore : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can settle events");
    };
    let sportsEvent = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };

    let eventResult = if (homeScore > awayScore) { #home } else if (homeScore < awayScore) { #away } else {
      #draw;
    };

    let updatedEvent : SportsEvent = {
      id = sportsEvent.id;
      sport = sportsEvent.sport;
      homeTeam = sportsEvent.homeTeam;
      awayTeam = sportsEvent.awayTeam;
      oddsHome = sportsEvent.oddsHome;
      oddsDraw = sportsEvent.oddsDraw;
      oddsAway = sportsEvent.oddsAway;
      startTime = sportsEvent.startTime;
      status = #settled;
      result = eventResult;
      var homeScore;
      var awayScore;
    };
    events.add(eventId, updatedEvent);

    bets.values().forEach(
      func(bet) {
        if (bet.eventId == eventId and bet.result == #pending) {
          if (bet.prediction == eventResult) {
            let payout = safeFloatToNat(bet.stake.toFloat() * bet.odds);
            bet.result := #won;
            bet.payout := payout;
            let winnerWallet = switch (wallets.get(bet.user)) {
              case (null) {
                let newWallet : UserWallet = { var balance = payout };
                wallets.add(bet.user, newWallet);
                newWallet;
              };
              case (?w) {
                w.balance += payout;
                w;
              };
            };
          } else {
            bet.result := #lost;
            bet.payout := 0;
          };
        };
      }
    );
  };

  public query ({ caller }) func getAllEvents() : async [SportsEventView] {
    events.values().toArray().map<SportsEvent, SportsEventView>(
      func(event) {
        sportsEventToView(event);
      }
    );
  };

  public query ({ caller }) func getEventsBySport(sport : Text) : async [SportsEventView] {
    events.values().flatMap<SportsEvent, SportsEvent>(func(s) { if (s.sport == sport) { [s].values() } else { [].values() } }).toArray().map<SportsEvent, SportsEventView>(
      func(event) {
        sportsEventToView(event);
      }
    );
  };

  public query ({ caller }) func getUserBets() : async [BetView] {
    bets.values().flatMap<Bet, Bet>(func(b) { if (b.user == caller) { [b].values() } else { [].values() } }).toArray().map<Bet, BetView>(
      func(bet) {
        betToView(bet);
      }
    );
  };

  public query ({ caller }) func getOpenBets() : async [BetView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all open bets");
    };
    bets.values().flatMap<Bet, Bet>(func(b) { if (b.result == #pending) { [b].values() } else { [].values() } }).toArray().map<Bet, BetView>(
      func(bet) {
        betToView(bet);
      }
    );
  };
};
