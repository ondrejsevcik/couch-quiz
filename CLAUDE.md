# Couch Quiz

A trivia board quiz for 2–6 players sharing one screen — phone, iPad or
desktop. Published on GitHub Pages. Don't name the TV quiz show it's modelled
on anywhere in the repo, UI, clues or GitHub description — it's a trademark.

## Hard constraints

- **Zero dependencies, ever.** No npm packages, no CDN links, no build step.
  Dependencies were explicitly rejected as a security concern.
- **Everything lives in `index.html`** — markup, CSS, and JS in one file.
- **Must run from `file://`.** Never introduce `fetch()` of local files; CORS
  blocks it on `file://`. This is why the questions are a JS object literal
  inside the `<script>` instead of a separate `questions.json`.
- **One shared device.** No server, no multi-device sync.

Node may be used for *testing only*. It must never become a runtime requirement.

## Game rules

A setup screen comes first: edit player names (2–6, blank defaults show
"Player N" — no real names in the public repo), then pick exactly 6 categories
from the pool or hit "Random 6", which prefers categories not played yet.
Players agree out loud who answers, then tap that player's button. There are
no buzzers.

Because the screen is shared, **revealing the answer reveals it to everyone**.
So there are no steals: pick a player → answer is revealed → Correct (+value)
or Wrong (−value) → back to the board either way. Wrong answers go negative.

"Nobody knows" reveals the answer without changing any score.

"New board" returns to setup; scores carry over unless the player count
changed. Player names, played categories and the game in progress are saved in
`localStorage` so a mobile browser discarding the tab doesn't lose the game.

The board is 6 categories x 6 clues, valued 100-600. No final round and no
bonus wager tiles (not requested; both would need wager entry).

## Layout

The whole board must fit the viewport without scrolling on every device —
people play from a couch and won't scroll to reach the 600 row. Board rows use
`1fr` sizing and fonts use `clamp()` against both `vw` and `vh`. Two media
queries matter: `max-width: 600px` (portrait phone, tight columns) and
`max-height: 500px` (landscape phone: title hidden, scores inline, compact
clue screen so the judge buttons stay in view). Category names must be short —
max ~12 characters per word — or they break mid-word in a phone column.

Check changes at 390x844, 844x390, 1024x768 and desktop.

## Editing questions

The `CATEGORIES` array at the top of the `<script>` block. Each category needs
**exactly 6 clues**, ordered easiest → hardest, mapping to 100 through 600.
Each clue is `["question text", "answer"]`. Tests enforce both invariants.

The pool (20 categories at last count) should stay broad — classic trivia,
tech & internet, culture & lifestyle — so there's always something fresh to
pick. Grow it by adding whole categories; no country- or group-specific
categories (Denmark was dropped for that reason).

### Difficulty

**Aim high — clues have repeatedly been written too easy and sent back.** These
players are well-travelled adults who follow tech and culture. Calibrate so the
100 is what everyone gets, the 300–400 splits the room, and the 600 is one
nobody may take. A board where every clue gets answered is a failed board.

Rules of thumb:

- If the answer is the single most famous example of its category, it's too
  easy. Not the Mona Lisa, not Everest, not Tokyo. Go one layer down.
- Prefer the *second* fact about a thing over the first: not "who painted the
  Mona Lisa" but the detail only someone interested would know.
- A good hard clue is still *gettable by reasoning* — an obscure fact plus a
  path to it beats pure recall of a name nobody has heard.
- Approach from an unexpected angle: consequences, origins, disputes, near
  misses, the thing that almost happened.
- Avoid clues answerable from the category name plus one common association.

### Every question change requires a fact-check

**Any time you add or edit a clue, fact-check the answers before committing.**
Not optional, and not "it looks right" — verify with a web search. Dispatch a
subagent with fresh context so it can't inherit assumptions from whoever wrote
the clue. Past rounds caught a river that wasn't the longest, a race that
stopped finishing in Paris, and a word credited to the wrong brother.

**Keep it fast — aim for ~90% accuracy in about a minute, not 100% in six.**
This is a party game, not a publication. A wrong clue costs an argument, not a
correction notice. So:

- Run the check on `model: haiku`. Full-strength models spend minutes writing
  prose nobody reads.
- Send a **numbered list of only the risky claims**, not "check all 36 clues".
  Pre-identify what's likely wrong; skip anything you're confident about.
- Demand terse output: `N. OK` or `N. WRONG: ... -> FIX: ...`. Explicitly ban
  preamble and summaries.
- State your own suspicion in the prompt ("I think X is wrong, verify"). It
  focuses the search and catches the cases that matter.

Watch especially for **time-sensitive claims** — "most", "largest",
"best-selling", current record holders. These were true once and rot silently.
Prefer settled history (founding dates, acquisitions, firsts) over current
standings.

Clues must also have **exactly one defensible answer**. A clue with several
valid answers causes arguments mid-game, which is the thing to avoid.

### No answer leakage

A clue must not contain its own answer, or an obvious translation or cognate of
it. Real examples that were caught and fixed:

- "This Czech beer style, born in **Plzen** in 1842" → answer *Pilsner*
- "This German brand's name means **'people's car'**" → answer *Volkswagen*
- "calls its communities **subreddits** and its users **redditors**" → *Reddit*

Also avoid one clue naming another clue's answer anywhere on the board.

Run `node test/leak.cjs` to catch both automatically. It reports exact-word
leaks, stem matches, and cross-clue mentions. It over-reports (short words like
"world" or "engine" trip it), so read the output rather than trusting the count.

### Song lyrics

Do not put song lyrics in clues — not even a single line. Build music clues
from authorship, performers, year, chart history, and background instead.

## Testing

Logic tests run the page's script inside a `vm` context against a hand-rolled
DOM stub:

```
node test/run.cjs    # game logic
node test/leak.cjs   # answer leakage in clues
```

**A passing logic suite does not mean the game works.** The stub's
`classList.add` is a no-op, so a missing-`show`-class bug once made every clue
invisible while all 20 tests passed. Any change touching `render*` must be
clicked through in a real browser before committing.

Browser checks so far have used the Safari MCP (`mcp__safari-mcp-stp__*`); the
Chrome extension has not connected in this environment. Its viewport screenshot
comes back blank — use `full_page: true`.

## Commits

Conventional Commits. Commit after each meaningful change rather than batching.
