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
for resetting the board between Friday sessions, and for keeping a persistent
roster of regulars that can be bulk-added to a night's sign-up list in one go.

## Core mechanics

- **8 courts**, each: `idle` (open) / `closed` (unavailable tonight — someone
  else is using it) / `playing` (doubles, singles, or server-out).
- **Sign-up / check-in**: people can add their name any time during the week
  (pre-session sign-up mode); once the board goes live, the same form is used
  for walk-in check-ins.
- **Swap pool**: the engine automatically groups waiting players into pools of
  4, and tops up any in-progress pool the moment enough people are free — but
  the operator can also hand-build or rearrange a group at any time by
  dragging waiting players into a pool (or dragging a pool member back out).
  A full pool gets a "Ready — drag to a court" hand icon and can be dropped
  on any open court to start the match there.
- **Winners stay, split, and get new partners; losers go back in line** —
  matching the [format's own rules](http://www.aaacta.org/Drop_In/Format.html):
  when a match finishes, the losing team returns to the plain waiting list,
  while the winning team splits apart and drops into a pool earmarked to
  return to that same court. The moment two new partners are available, that
  pool auto-fills and sends itself straight back to the court — no manual
  drag needed — so the court rarely goes idle and nobody keeps the same
  partner twice in a row.
- **Partner/opponent variety**: whenever a foursome is finalized, the engine
  tries the 3 possible team splits and picks whichever minimizes repeat
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
- **A player needs to leave mid-match**: tap their name and confirm "Remove
  from play" — no auto-substitute. This leaves an open slot on the court:
  drag a waiting/pooled player onto it to fill the gap, or drag the whole
  short-handed match onto the waiting list (or a new pool) to break it up.
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
- `admin.html` — admin-only page to reset the board for next Friday and to
  manage a persistent roster of regulars (`roster/regulars`, separate from
  the weekly board so it survives every reset) for bulk-adding to a night's
  sign-up list. Not linked from `index.html` on purpose; bookmark it directly.
- `firebase-init.js` — shared Firebase/Firestore setup used by both pages.
