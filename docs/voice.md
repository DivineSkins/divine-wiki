# How to write guides

Write so a 12-year-old can follow every step without getting stuck. Most readers are not native English speakers. Assume nothing.

## Rules

### Write short

- One idea per sentence.
- One action per step.
- If a sentence is longer than 20 words, break it up.
- If a paragraph is longer than 3 sentences, break it up.

### Use simple words

Pick the plain word over the fancy one.

| Don't write  | Write       |
| ------------ | ----------- |
| Utilize      | Use         |
| Initiate     | Start       |
| Navigate to  | Go to, open |
| Terminate    | Close, stop |
| Subsequently | Then, after |
| In order to  | To          |
| Ensure that  | Make sure   |
| Prior to     | Before      |
| Execute      | Run         |
| Select       | Click, pick |

### Talk to the reader directly

Use **"you"**. Don't use "the user" or "one should".

- Bad: _The user should then proceed to launch the application._
- Good: _Open Celestial._

### Give commands, not descriptions

Each step starts with a verb. Tell the reader what to do.

- Bad: _There is a settings button in the top right corner that you can press._
- Good: _Click the settings button in the top right corner._

### Explain jargon the first time you use it

If you have to use a technical word, explain it the first time, then use it freely.

- Good: _A mod is a file that changes how the game looks. Download the mod you want._

Words that always need explaining on first use: mod, fantome file, client, patch, champion (for non-LoL-players reading tool docs), import, override.

### One step per line

Number the steps. Don't put multiple actions in one step.

Bad:

```
1. Open Celestial, log in, then go to the catalog and pick a skin.
```

Good:

```
1. Open Celestial.
2. Log in.
3. Go to the catalog.
4. Pick a skin.
```

### Show the outcome

After a step, tell the reader what they should see. This helps them know if something went wrong.

- _Click Install. A green checkmark appears when the skin is ready._

### Warn before the danger, not after

If a step has a risk, the warning goes **before** the step — not after.

- Good: _Before you install, close League of Legends. Installing while the game is open can break it._

### Link, don't repeat

If something is explained on another page, link to it. Don't re-explain it.

### No filler

Cut these words wherever you find them:

- "Simply", "just", "basically", "easily", "quickly"
- "Please"
- "As you can see", "as mentioned above"
- "It's important to note that"

If a step is simple, the reader will notice. You don't need to tell them.

### No em dashes

Never use em dashes (`—`) or en dashes (`–`) in prose. They look fancy but slow readers down, especially non-native English speakers.

Rewrite with a period, comma, colon, or parentheses instead.

| Don't write                                    | Write                                         |
| ---------------------------------------------- | --------------------------------------------- |
| _It's safe — outside Korea._                   | _It's safe outside Korea._                    |
| _Open Flint — the all-in-one tool._            | _Open Flint, the all-in-one tool._            |
| _Three things to check — files, paths, names._ | _Three things to check: files, paths, names._ |

Regular hyphens (`-`) in compound words (`client-side`, `step-by-step`) are fine.

## Safety wording

Safety comes up in almost every guide. Say it the same way every time.

- **Custom skins are safe outside Korea and China.** No bans since 2014 when you use trusted tools like Celestial.
- **Never use custom skins in Korea or China.** The anti-cheat there blocks all mods.
- **Custom skins are client-side only.** Only you see them. Teammates and enemies see the default skin.
- **They give no gameplay advantage.** Nothing about the game changes — only how it looks.

Put safety info **at the top of install guides**, not buried in a footnote.

## Terminology (do not break these)

| Never write             | Write instead              |
| ----------------------- | -------------------------- |
| Skin hack, skin changer | Custom skin, mod           |
| Cheat, exploit          | Mod, custom skin           |
| Unlock skins            | Customize, change the look |
| Undetectable            | Safe, client-side          |
| Buy, purchase           | Download, get              |
| Free-to-play skins      | Custom skins               |

These are not style preferences. "Hack" and "undetectable" suggest breaking rules. Custom skins don't break rules — the wrong word makes the whole wiki look shady.

## Structure of a good guide

1. **What this guide is for** — one sentence.
2. **What you need before you start** — tools, accounts, files.
3. **The steps** — numbered, one action per step.
4. **How to check it worked** — what the reader should see at the end.
5. **If something goes wrong** — common problems and fixes.

Put the most useful thing at the top. Readers skim. If the headline answers their question, they leave happy. If they have to scroll to find it, they leave annoyed.

## Before you publish, check

- Can a 12-year-old follow every step?
- Did you use any word from the "Never write" list?
- Does every step start with a verb?
- Is every sentence under 20 words?
- Did you say what the reader should see after each big step?
- Is the safety info near the top?
