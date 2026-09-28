# Couch Quiz

A trivia board for 2–6 players sharing one screen — phone,
iPad or laptop. One HTML file, no dependencies, no server.

**Play:** open `index.html` in any browser, or use the GitHub Pages link.
On a phone, landscape gives the roomiest board; "Add to Home Screen" makes it
feel like an app.

## How to play

1. Enter player names and pick 6 of the 20 categories (or tap **Random 6**,
   which favours ones you haven't played).
2. Pick a tile. Decide out loud who answers and tap their name.
3. The answer is revealed to everyone — tap **Correct** (+value) or
   **Wrong** (−value). There are no steals. **Nobody knows** just reveals it.

Scores and the board are saved on the device, so a reload doesn't lose the
game.

## Questions

Clues live in the `CATEGORIES` array in `index.html` — 6 per category, easiest
to hardest. They're written to be hard and fact-checked; see `CLAUDE.md` for
the rules.

## Tests

```
node test/run.cjs    # game logic
node test/leak.cjs   # clues that give away their own answer
```

Node is only needed for tests, never to play.

## License

MIT — see [LICENSE](LICENSE).
