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
- **Check-in**: "+ Add Me" always drops someone straight into the waiting
  list — there's no separate pre-session mode. Add your name any time
  during the week and the swap-pool engine immediately starts grouping and
  queuing you same as a walk-in on the night itself.
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
- **Server-out mode**: an odd number of players off court means someone is
  always one player short of a full group, so this mode has every on-court
  player rotate through their own "Out" button — tapping it pulls the
  longest-waiting free agent in to take that spot, and the outgoing player
  joins the back of the pool. It's declared by a person, not automatic: the
  header banner turns amber and a "Start Server-out" button lights up once
  the count is actually odd, and someone who can see they're really the
  odd one out (nobody else mid-check-in) taps it. Driving this off the raw
  headcount instead caused false flips — with two people checking in at
  once, the count blips even the moment the first one finishes, before the
  second is done. "End Server-out" is always available once it's on, since
  standing down is never the wrong call.
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
- **Profile photos**: tap a name on the board (a swap-pool chip, a court
  player, or — since tapping a waiting-list name already selects it for
  singles — its avatar circle specifically) and choose "📷 Profile photo"
  to open `profile.html` scoped to just that person — there's no
  browsable list of everyone else's names, on purpose. From there, add a
  photo from your camera or library,
  then drag to reposition and use the slider to zoom before confirming —
  a simple built-in cropper, no library. The result is resized down to a
  small square entirely on-device before saving — nothing but that final
  thumbnail ever leaves the phone — and then shows up as a small round
  avatar next to that name
  anywhere it appears on the board. Matched by exact name, since there's
  no login system tying a photo to a person; the "+ Add Me" box hints
  whether what you typed matches an existing regular ("Welcome back") or
  reads as a new name, to help everyone spell their own name consistently.
  Editing is behind a per-person password (default `12345678` for
  everyone until changed, editable from the profile page itself) — a
  deterrent against a mis-tap on someone else's name, not real security,
  same as the admin passphrase. An admin can view or reset anyone's
  password from the 🔑 next to their name in `admin.html`'s roster.
- **Sound alerts**: tap the 🔕 button in the header (it becomes 🔔) to turn
  on alerts for this device. Each alert is a short tuned tone burst — a
  different one per event, so it hints at what's coming before anyone's
  even listening — followed by a spoken phrase repeated twice with a
  pause: "Server out" when the board switches into Server-out mode,
  "Normal mode" when it switches back, and "Match complete" whenever any
  court finishes a match. Saying the words outright means nobody has to
  learn what a beep means. Meant for a device with the volume maxed (the
  courtside iPad, or a phone) so the whole area hears it without watching
  the screen. It's per-device and doesn't sync or persist across a reload
  — browsers only allow sound/speech after a real tap unlocks them, so
  re-enable it each time the page loads.

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
3. **Skill-aware pairing**: add a ranking/skill level to each profile
   (`profile.html`, alongside the photo) so `pickBestPartition` can balance
   skill across a foursome, not just minimize repeat partners/opponents —
   refining pool splits beyond pure variety.

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
- `profile.html` — public, unlocked page for adding/replacing/removing a
  profile photo (`roster/regulars`'s `photos` map, keyed by name). Only
  reachable via `?name=` from the board's own per-player menu — never
  shows a name other than the one it was opened for. Deliberately kept
  separate from `admin.html`'s passphrase gate — this is a self-service
  page for players, not an admin function.
- `firebase-init.js` — shared Firebase/Firestore setup used by all pages.
