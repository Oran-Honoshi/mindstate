export type CountryGameBoard = {
  answer: string;         // country name uppercase
  capital: string;
  continent: string;
  flag: string;           // emoji flag
  hint1: string;          // population hint
  hint2: string;          // geography hint
  wordLength: number;
  maxGuesses: number;
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

export type LetterResult = "correct"|"present"|"absent";

const COUNTRIES: {
  name: string; capital: string; continent: string;
  flag: string; hint1: string; hint2: string;
}[] = [
  { name:"FRANCE",    capital:"Paris",       continent:"Europe",        flag:"🇫🇷", hint1:"67 million people",    hint2:"Has the Eiffel Tower" },
  { name:"BRAZIL",    capital:"Brasília",    continent:"S. America",    flag:"🇧🇷", hint1:"215 million people",   hint2:"Largest country in South America" },
  { name:"JAPAN",     capital:"Tokyo",       continent:"Asia",          flag:"🇯🇵", hint1:"125 million people",   hint2:"Island nation in the Pacific" },
  { name:"EGYPT",     capital:"Cairo",       continent:"Africa",        flag:"🇪🇬", hint1:"104 million people",   hint2:"Home of the Pyramids" },
  { name:"CANADA",    capital:"Ottawa",      continent:"N. America",    flag:"🇨🇦", hint1:"38 million people",    hint2:"Second largest country by area" },
  { name:"INDIA",     capital:"New Delhi",   continent:"Asia",          flag:"🇮🇳", hint1:"1.4 billion people",   hint2:"Largest democracy in the world" },
  { name:"ITALY",     capital:"Rome",        continent:"Europe",        flag:"🇮🇹", hint1:"60 million people",    hint2:"Boot-shaped peninsula" },
  { name:"RUSSIA",    capital:"Moscow",      continent:"Europe/Asia",   flag:"🇷🇺", hint1:"144 million people",   hint2:"Largest country by area" },
  { name:"MEXICO",    capital:"Mexico City", continent:"N. America",    flag:"🇲🇽", hint1:"130 million people",   hint2:"Borders the USA to the south" },
  { name:"CHINA",     capital:"Beijing",     continent:"Asia",          flag:"🇨🇳", hint1:"1.4 billion people",   hint2:"Most populous country" },
  { name:"SPAIN",     capital:"Madrid",      continent:"Europe",        flag:"🇪🇸", hint1:"47 million people",    hint2:"Iberian Peninsula" },
  { name:"KENYA",     capital:"Nairobi",     continent:"Africa",        flag:"🇰🇪", hint1:"55 million people",    hint2:"Crosses the Equator" },
  { name:"AUSTRALIA", capital:"Canberra",    continent:"Oceania",       flag:"🇦🇺", hint1:"26 million people",    hint2:"Continent and country" },
  { name:"TURKEY",    capital:"Ankara",      continent:"Europe/Asia",   flag:"🇹🇷", hint1:"85 million people",    hint2:"Spans two continents" },
  { name:"SWEDEN",    capital:"Stockholm",   continent:"Europe",        flag:"🇸🇪", hint1:"10 million people",    hint2:"Northern Scandinavian country" },
  { name:"NIGERIA",   capital:"Abuja",       continent:"Africa",        flag:"🇳🇬", hint1:"220 million people",   hint2:"Most populous African country" },
  { name:"POLAND",    capital:"Warsaw",      continent:"Europe",        flag:"🇵🇱", hint1:"38 million people",    hint2:"Central European country" },
  { name:"PERU",      capital:"Lima",        continent:"S. America",    flag:"🇵🇪", hint1:"33 million people",    hint2:"Home of Machu Picchu" },
  { name:"ISRAEL",    capital:"Jerusalem",   continent:"Asia",          flag:"🇮🇱", hint1:"9 million people",     hint2:"Mediterranean Middle East" },
  { name:"GREECE",    capital:"Athens",      continent:"Europe",        flag:"🇬🇷", hint1:"11 million people",    hint2:"Birthplace of democracy" },
  { name:"PORTUGAL",  capital:"Lisbon",      continent:"Europe",        flag:"🇵🇹", hint1:"10 million people",    hint2:"Western tip of Europe" },
  { name:"NORWAY",    capital:"Oslo",        continent:"Europe",        flag:"🇳🇴", hint1:"5 million people",     hint2:"Famous for fjords" },
  { name:"VIETNAM",   capital:"Hanoi",       continent:"Asia",          flag:"🇻🇳", hint1:"97 million people",    hint2:"S-shaped Southeast Asian country" },
  { name:"CHILE",     capital:"Santiago",    continent:"S. America",    flag:"🇨🇱", hint1:"19 million people",    hint2:"World's longest country" },
  { name:"MOROCCO",   capital:"Rabat",       continent:"Africa",        flag:"🇲🇦", hint1:"37 million people",    hint2:"Northwest African country" },
  { name:"UKRAINE",   capital:"Kyiv",        continent:"Europe",        flag:"🇺🇦", hint1:"44 million people",    hint2:"Largest country entirely in Europe" },
  { name:"CUBA",      capital:"Havana",      continent:"N. America",    flag:"🇨🇺", hint1:"11 million people",    hint2:"Caribbean island nation" },
  { name:"IRAN",      capital:"Tehran",      continent:"Asia",          flag:"🇮🇷", hint1:"86 million people",    hint2:"Ancient Persian empire" },
  { name:"GHANA",     capital:"Accra",       continent:"Africa",        flag:"🇬🇭", hint1:"33 million people",    hint2:"First sub-Saharan African independence" },
  { name:"NEPAL",     capital:"Kathmandu",   continent:"Asia",          flag:"🇳🇵", hint1:"30 million people",    hint2:"Home of Mount Everest" },
];

const EASY_COUNTRIES   = COUNTRIES.filter(c => c.name.length <= 5);
const MEDIUM_COUNTRIES = COUNTRIES.filter(c => c.name.length >= 5 && c.name.length <= 7);
const HARD_COUNTRIES   = COUNTRIES.filter(c => c.name.length >= 7);

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedToNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateCountryGame(seed: string, difficulty: "easy"|"medium"|"hard"): CountryGameBoard {
  const pool = difficulty === "easy" ? EASY_COUNTRIES : difficulty === "medium" ? MEDIUM_COUNTRIES : HARD_COUNTRIES;
  const rng = mulberry32(seedToNum(seed));
  const country = pool[Math.floor(rng() * pool.length)];
  const maxGuesses = difficulty === "easy" ? 7 : difficulty === "medium" ? 6 : 5;
  return {
    answer: country.name,
    capital: country.capital,
    continent: country.continent,
    flag: country.flag,
    hint1: country.hint1,
    hint2: country.hint2,
    wordLength: country.name.length,
    maxGuesses,
    seed,
    difficulty,
  };
}

export function scoreGuess(guess: string, answer: string): LetterResult[] {
  const result: LetterResult[] = Array(guess.length).fill("absent");
  const answerArr = answer.split("");
  const used = Array(answer.length).fill(false);
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) { result[i] = "correct"; used[i] = true; }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < answer.length; j++) {
      if (!used[j] && guess[i] === answer[j]) { result[i] = "present"; used[j] = true; break; }
    }
  }
  return result;
}
