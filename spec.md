# BetSport

## Current State
New project. Empty backend and minimal frontend scaffold.

## Requested Changes (Diff)

### Add
- User wallet with balance (virtual credits, starts at 1000)
- Sports events management (admin creates events with odds)
- Browse live and upcoming events by sport category
- Bet slip: select odds, enter stake, place bet
- Open bets tracker
- Bet history (won/lost/pending)
- Authorization: admin role creates/manages events and sets results; regular users bet
- Admin panel: create events, set final score/result, settle bets

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: user profiles with balance, sports events (sport, teams, odds, status), bets (user, event, selection, stake, outcome)
2. Backend: place bet (deduct balance), settle event (pay out winners)
3. Backend: admin functions for creating events and settling results
4. Frontend: dark sportsbook UI matching design preview
5. Frontend: live events list with odds chips, category filter
6. Frontend: bet slip panel (right rail)
7. Frontend: open bets and bet history
8. Frontend: admin panel for managing events
