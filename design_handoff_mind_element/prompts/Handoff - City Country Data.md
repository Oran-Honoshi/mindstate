# Handoff — City / Country data & images (Name the City / Name the Country)

The prototype ships with one sample (Kyoto / Japan) using local art in `assets/places/`. For production, source places dynamically. Implement server-side (cache results; don't hammer these APIs from the client).

## Facts
- **Wikipedia REST summary** — free, no key:
  `GET https://en.wikipedia.org/api/rest_v1/page/summary/{Title}`
  Use the `extract` (intro paragraph) → split into 2–3 short facts. e.g. `/summary/Kyoto`, `/summary/Japan`.
- **Wikidata** (structured, language-agnostic) for capital, population, area, currency:
  `GET https://www.wikidata.org/wiki/Special:EntityData/{QID}.json` (Japan = Q17). Best for the fact chips.
- **REST Countries** — free, great for the country game (flag, capital, population, region):
  `GET https://restcountries.com/v3.1/name/{country}` → returns `flags.svg`, `capital`, `population`, `region`.

## Images
- **Wikipedia summary** response also gives `thumbnail.source` / `originalimage.source` (a representative photo) — usable directly, **check licensing/attribution** (mostly CC-BY-SA; show credit).
- For the stylized look in the mockups, prefer **generated illustrations** (see *Cooler Assets* prompt pack) stored per place, falling back to the Wikipedia photo.
- **Flags:** don't generate — use real SVGs. REST Countries `flags.svg`, or the `flag-icons` library, or Wikipedia.

## Suggested data shape (what the UI expects)
```json
{
  "id": "kyoto",
  "type": "city",
  "name": "Kyoto",
  "country": "Japan",
  "image": "assets/places/kyoto.png",        // generated art, or Wikipedia thumbnail
  "flag": "https://flagcdn.com/jp.svg",        // country game only
  "facts": [
    "Japan's capital for over 1,000 years",
    "Home to 1,600+ Buddhist temples",
    "Famous for spring cherry blossoms"
  ],
  "options": ["Lisbon", "Kyoto", "Cairo", "Oslo"]  // 1 correct + 3 distractors
}
```

## Where it plugs into the prototype
- `game-screens.jsx → NAME_DATA` is the placeholder map. Replace with a fetched/cached list.
- The `<image-slot src=…>` in `NameGuess` already points at `data.photo`; swap for the resolved image URL.
- The facts panel renders `data.facts`; the flag renders from `data.flag` (currently a small inline SVG for `jp` — switch to an `<img src=flagUrl>`).

## Attribution / caching
- Cache API responses (e.g. 30 days) — facts & flags rarely change.
- If using Wikipedia images/text, surface a small "Source: Wikipedia (CC BY-SA)" credit on the reveal panel.
