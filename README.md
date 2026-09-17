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
- **A pool reads as team vs. team**, e.g. "Alex & Jamie vs Morgan & Casey" —
  not just four names in a row. The engine picks that initial split to
  minimize repeat partners/opponents, but it's just a starting point: drag
  one pool member directly onto another to swap their positions (and so
  their side), so the operator can re-pair a foursome by hand before it goes
  to a court. Whatever's shown is exactly what starts on court.
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
- **Winners vs. winners, losers vs. losers**: a just-finished match's winner
  pair and loser pair each show up as their own tagged 2-person pool. If
  another court finishes around the same time, a "⚡ Combine with other
  winners/losers" button appears on both pools of the same kind, letting the
  operator merge them straight into a new match (teams re-picked the same
  way as any other foursome) instead of waiting for the general waiting
  list. Each pool still tops up from the waiting list as usual if no other
  same-kind pool is available to combine with.
- **Server-out mode**: the moment 3 or fewer players are in the free pool,
  every active court (not just new ones) switches to Server-out. Since the
  app can't track whose serve it actually is, every on-court player gets
  their own "Out" button — tapping it pulls the longest-waiting free agent
  in to take that spot, and the outgoing player joins the back of the pool.
- **Singles**: tap two names in the waiting list to select them, then start a
  singles match on the lowest-numbered open court.
- **Move a group**: any active court can relocate its whole match to another
  open court (useful if a court needs to be vacated). If no court is free,
  "Move to…" also highlights the swap pool's "new group" spot and the
  waiting list — tap either to send that match there instead (as one fresh
  pool, or scattered back into the general line) rather than being stuck
  with nowhere to move it.
- **A player needs to leave mid-match**: tap their name and confirm "Remove
  from play" — no auto-substitute. This leaves an open slot on the court:
  drag a waiting/pooled player onto it to fill the gap, or drag the whole
  short-handed match onto the waiting list (or a new pool) to break it up.
- **Close a court**: marks a court unavailable (e.g. non-drop-in players are
  using it). Closed courts are invisible to the swap engine, singles
  assignment, and the move-to-another-court picker — everywhere the app
  looks for an open court.
- **Undo/redo & change history**: the ↶/↷ buttons in the header step back
  and forward through every check-in, drag, and match result, and the 🕘
  history panel lists the same stack with a one-tap "Restore" on any past
  point — so a mis-click on any device can be rolled back from any other
  device. Backed by a shared Firestore doc (`boards/friday_history`), kept
  to the last 15 actions.
- **Session date**: shown at the top of the board (defaults to today);
  set it ahead of time from `admin.html` when prepping a specific Friday.
- **QR links**: two buttons under the header ("WhatsApp group QR" / "Live
  board QR") pop up a scannable QR code (generated via api.qrserver.com)
  for the club's WhatsApp invite link and for this board's own URL, each
  with a Close button.
- **Sound alerts**: tap the 🔕 button in the header (it becomes 🔔) to turn
  on ~4-5 second high-pitched alerts for this device — a rapid two-tone
  siren when the board flips between normal and Server-out mode, and a
  slow ascending bell arpeggio whenever any court finishes a match. The
  two are deliberately different in pitch, rhythm, and texture (not just
  volume), so people can learn to tell them apart by ear even through
  court noise. Meant for a device with the volume maxed (the courtside
  iPad, or a phone) so the whole area can hear a change without watching
  the screen. It's per-device and doesn't sync or persist across a reload
  — browsers only allow sound after a real tap unlocks it, so re-enable
  it each time the page loads.

## iPad kiosk mode

One-time setup on the board iPad:

1. **Auto-Lock off** — Settings → Display & Brightness → Auto-Lock → Never,
   so the screen doesn't sleep mid-session.
2. **Add the board to the Home Screen** — in Safari, open the live board
   (the "Live board QR" link in the header scans to this same URL), tap the
   Share icon → **Add to Home Screen** → name it "Friday Drop-In". Both
   `index.html` and `admin.html` carry the Safari meta tags that make this
   open full-screen with no address bar/tabs, like a real app — launch it
   from this new icon, not from Safari, to get that. Repeat for `admin.html`
   if you want a one-tap admin icon too (it's not linked from the board on
   purpose, so this is the easiest way to reach it from the iPad itself).
3. **Enable Guided Access** — Settings → Accessibility → Guided Access → on.
   Under **Passcode Settings**, turn on Face ID/Touch ID so you don't have to
   type a passcode every time you start or stop it.

Each Friday:

- Launch the **Friday Drop-In** home-screen icon (not Safari).
- **Start kiosk lock**: triple-click the side button → **Start** (top
  right). The iPad is now locked to the board — no accidental swipes to the
  home screen, no one backing out to Safari or another app.
- **Switch out quickly** (weekly reset, bulk-adding regulars, or just
  handing the iPad off for something else): triple-click again → Face
  ID/passcode → **End** (top left). You're back to normal iPad use — open
  the **Drop-In Admin** icon if you made one, do what you need, then
  relaunch **Friday Drop-In** and Start Guided Access again. The whole
  round trip is a few seconds.
- In practice this is rarely needed mid-session: the ↶/↷ undo/redo buttons
  and the 🕘 history panel (see above) fix most mis-clicks right from the
  board itself, without ever leaving kiosk mode.

## Suggested next steps

1. **Split the single file** into a small app (state/engine logic, rendering,
   and the two entry points: the board view and a lightweight phone view).
2. **Tighten Firestore access**: the security rules currently allow anyone to
   read/write (`allow read, write: if true`) since there's no login system —
   fine for a casual club app with nothing sensitive in it, but worth
   revisiting if that ever changes.

## Files

- `index.html` — the live board (courts, swap pool, waiting list, sign-ups).
- `admin.html` — admin-only page to reset the board for next Friday and to
  manage a persistent roster of regulars (`roster/regulars`, separate from
  the weekly board so it survives every reset) for bulk-adding to a night's
  sign-up list. Not linked from `index.html` on purpose; bookmark it directly.
- `how-it-works.html` — a 12-slide walkthrough of the player-facing loop
  (sign up → waiting → pool → court → finish), linked from the board's
  header ("📖 How it works"). Self-contained, no Firestore — safe to open
  standalone, and the UI snippets in it are hand-built to match `index.html`'s
  own CSS rather than live screenshots, so keep them in sync if the board's
  look changes.
- `firebase-init.js` — shared Firebase/Firestore setup used by both pages.
