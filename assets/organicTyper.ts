/**
 * organicTyper.ts
 * Mimics human typing: variable speed, realistic typos, corrections.
 * Pure ES2022+ (no dependencies).
 *
 * @param text        - The string to "type"
 * @param onUpdate    - Called with the current visible string each tick
 * @param opts        - Optional tuning knobs
 * @returns           Resolves when typing is complete
 */

// ─── Keyboard Adjacency Map ───────────────────────────────────────────────────
// Each key maps to its physically adjacent keys on a QWERTY layout.
// Characters not present in the map fall back to themselves.
const ADJACENCY: Record<string, string | undefined> = {
  a: "sqwz",  b: "vghn",  c: "xdfv",  d: "serfcx", e: "wsdr34",
  f: "drtgvc", g: "ftyhbv", h: "gyujnb", i: "ujko89", j: "huikmn",
  k: "jiolm,", l: "kop;,.", m: "njk,",  n: "bhjm",   o: "iklp90",
  p: "ol;[-0", q: "wa12",   r: "edft45", s: "aqwedxz", t: "rfgy56",
  u: "yhji78", v: "cfgb",   w: "qase23", x: "zsdc",   y: "tghu67",
  z: "asx",    " ": " ",
  "1": "2q",   "2": "13qw", "3": "24we", "4": "35er", "5": "46rt",
  "6": "57ty", "7": "68yu", "8": "79ui", "9": "80io", "0": "9-op",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Uniform random float in [min, max) */
const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

/** Bernoulli trial: true with probability p */
const chance = (p: number): boolean => Math.random() < p;

/** Pick a random adjacent key, or the key itself if none found */
const adjacentKey = (ch: string): string => {
  const pool = ADJACENCY[ch.toLowerCase()] ?? ch;
  const candidates = pool.replace(ch.toLowerCase(), "");
  if (!candidates) return ch;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  // Preserve original casing
  return ch === ch.toUpperCase() ? pick.toUpperCase() : pick;
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Tuning knobs for {@link organicTyper}.
 */
export interface TypingOptions {
  baseDelay: number;       // Median ms per character          (default 90)
  jitter: number;          // ± random ms added to each key    (default 60)
  typoRate: number;        // Probability of a typo per char   (default 0.07)
  burstRate: number;       // Probability of a typing burst     (default 0.15)
  pauseRate: number;       // Probability of a long think-pause (default 0.04)
  pauseDuration: number;   // How long think-pauses last (ms)  (default 600)
  backspaceDelay: number;  // ms per backspace key              (default 110)
  correctionGap: number;   // ms pause before correcting typo  (default 250)
}

/** Callback invoked with the currently visible buffer. */
export type TypingUpdate = (text: string) => Promise<void> | void;

/**
 * Types `text` as a human would: variable speed, realistic typos, corrections.
 */
export async function organicTyper(
  text: string,
  onUpdate: TypingUpdate,
  opts: Partial<TypingOptions> = {},
): Promise<void> {
  const {
    baseDelay      = 90,
    jitter         = 60,
    typoRate       = 0.07,
    burstRate      = 0.15,
    pauseRate      = 0.04,
    pauseDuration  = 600,
    backspaceDelay = 110,
    correctionGap  = 250,
  } = opts;

  let buffer = "";         // What the user can currently "see"
  let burstMode = false;   // Typing in a fast burst?
  let burstRemaining = 0;

  const emit = async (): Promise<void> => await onUpdate(buffer);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    // ── Burst mode toggle ────────────────────────────────────────────────────
    if (!burstMode && chance(burstRate)) {
      burstMode = true;
      burstRemaining = Math.floor(rand(3, 9)); // burst lasts 3–8 chars
    }
    if (burstMode) {
      burstRemaining--;
      if (burstRemaining <= 0) burstMode = false;
    }

    // ── Think-pause (e.g. hesitating before a word) ──────────────────────────
    if (ch === " " && chance(pauseRate)) {
      await sleep(pauseDuration + rand(0, 300));
    }

    // ── Decide whether to make a typo ────────────────────────────────────────
    const makeTypo = chance(typoRate) && ch.trim() !== ""; // no typos on spaces

    if (makeTypo) {
      // Choose a typo strategy
      const strategy = Math.random();

      if (strategy < 0.5) {
        // Strategy A: Wrong adjacent key → notice → backspace → retype
        const wrongKey = adjacentKey(ch);
        buffer += wrongKey;
        emit();
        await sleep(rand(baseDelay * 0.6, baseDelay * 1.2));

        // "Notice" the mistake after a short delay
        await sleep(correctionGap + rand(0, 200));

        buffer = buffer.slice(0, -1);
        emit();
        await sleep(backspaceDelay + rand(0, 40));

      } else if (strategy < 0.75) {
        // Strategy B: Extra duplicate character → backspace
        buffer += ch + ch;
        emit();
        await sleep(rand(60, 120));

        await sleep(correctionGap * 0.7);

        buffer = buffer.slice(0, -1);
        emit();
        await sleep(backspaceDelay);

      } else {
        // Strategy C: Transposition — type next char first, then backspace both, retype
        const nextCh = text[i + 1];
        if (nextCh && nextCh.trim() !== "") {
          buffer += nextCh;
          emit();
          await sleep(rand(50, 100));

          buffer += ch;
          emit();
          await sleep(rand(50, 100));

          // Realise and correct
          await sleep(correctionGap);
          buffer = buffer.slice(0, -2);
          emit();
          await sleep(backspaceDelay);
          buffer = buffer.slice(0, 0) + buffer; // no-op, just continue below
        }
      }
    }

    // ── Type the correct character ───────────────────────────────────────────
    buffer += ch;
    emit();

    // ── Delay before next character ──────────────────────────────────────────
    const speedMultiplier = burstMode ? 0.45 : 1;
    const delay = (baseDelay + rand(-jitter, jitter)) * speedMultiplier;
    await sleep(Math.max(20, delay));

    // ── Occasionally double-pause mid-word (distraction / searching for key) ─
    if (chance(0.03) && ch !== " ") {
      await sleep(rand(200, 500));
    }
  }
}
