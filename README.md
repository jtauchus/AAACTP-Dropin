# AAACTP Drop-In Board

A live court board for the Friday Social Drop-In Tennis format at Pioneer HS —
tracks check-ins, proposes swaps as matches finish, and displays everything on
a shared screen (iPad) so people can self-serve without a phone.

Format reference: http://www.aaacta.org/Drop_In/Format.html

## Status

`index.html` is backed by a shared Firestore document (`boards/friday`), so the
board and everyone's phones stay in sync in real time — check someone in on a
phone and it shows up on the iPad instantly, and vice versa. Per-device UI
state (which court you're mid-move on, which two names you've tapped for
singles) stays local and never syncs, so one device's in-progress action
doesn't leak onto another's screen. `admin.html` is a separate, unlinked page
for resetting the board between Friday sessions.

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

1. **Split the single file** into a small app (state/engine logic, rendering,
   and the two entry points: the board view and a lightweight phone view).
2. **QR check-in**: point the QR code at a real check-in form/page instead of
   the current placeholder graphic + modal.
3. **iPad kiosk setup**: Guided Access, Auto-Lock off, "Add to Home Screen"
   for a full-screen PWA — see prior discussion for details.
4. **Tighten Firestore access**: the security rules currently allow anyone to
   read/write (`allow read, write: if true`) since there's no login system —
   fine for a casual club app with nothing sensitive in it, but worth
   revisiting if that ever changes.

## Files

- `index.html` — the live board (courts, swap pool, waiting list, sign-ups).
- `admin.html` — admin-only page to reset the board for next Friday. Not
  linked from `index.html` on purpose; bookmark it directly.
- `firebase-init.js` — shared Firebase/Firestore setup used by both pages.
