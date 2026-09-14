# AAACTP Drop-In Board

A live court board for the Friday Social Drop-In Tennis format at Pioneer HS —
tracks check-ins, proposes swaps as matches finish, and displays everything on
a shared screen (iPad) so people can self-serve without a phone.

Format reference: http://www.aaacta.org/Drop_In/Format.html

## Status

`index.html` is a self-contained, in-memory prototype (no backend) built to
validate the mechanics. It resets on page refresh. Everything below describes
what it currently does — the next step is wiring it to a real-time backend so
multiple phones and the board stay in sync.

## Core mechanics

- **8 courts**, each: `idle` (open) / `closed` (unavailable tonight — someone
  else is using it) / `reserved` (a swap has been proposed for it) / `playing`
  (doubles, singles, or server-out).
- **Check-in**: self-serve via a name form (meant to sit behind a QR code), or
  added by anyone from the board for people without phones.
- **Swap pool**: when a match finishes, all 4 players drop into a shared free
  pool. Whenever ≥4 free players and an idle court exist, the engine proposes
  a foursome for that court — multiple proposals can be pending at once.
  Proposals expire after ~75s if nobody accepts, returning players to the
  pool. Tapping any single player out of a proposed group dissolves the whole
  group back to the pool (nothing partially locks in).
- **Partner/opponent variety**: when forming a foursome, the engine tries the
  3 possible team splits and picks whichever minimizes repeat
  partners/opponents for that group, based on a running history.
- **Server-out mode**: the moment 3 or fewer players are in the free pool,
  every active court (not just new ones) switches to Server-out. Since the
  app can't track whose serve it actually is, every on-court player gets
  their own "Out" button — tapping it pulls the longest-waiting free agent
  in to take that spot, and the outgoing player joins the back of the pool.
- **Singles**: tap two names in the waiting list to select them, then start a
  singles match on the lowest-numbered open court.
- **Move a group**: any active court can relocate its whole match to another
  open court (useful if a court needs to be vacated).
- **Close a court**: marks a court unavailable (e.g. non-drop-in players are
  using it). Closed courts are invisible to the swap engine, singles
  assignment, and the move-to-another-court picker — everywhere the app
  looks for an open court.

## Suggested next steps

1. **Pick a realtime backend** (Firebase or Supabase are the easiest fits) so
   the board and every phone share one live state instead of the in-memory
   `state` object in `index.html`.
2. **Split the single file** into a small app (state/engine logic, rendering,
   and the two entry points: the board view and a lightweight phone view)
   once it's backed by a real data store.
3. **QR check-in**: point the QR code at a real check-in form/page instead of
   the current placeholder graphic + modal.
4. **iPad kiosk setup**: Guided Access, Auto-Lock off, "Add to Home Screen"
   for a full-screen PWA — see prior discussion for details.

## Files

- `index.html` — the working prototype described above.
