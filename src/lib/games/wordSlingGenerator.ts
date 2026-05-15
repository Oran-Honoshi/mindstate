export type WordleBoard = {
  answer: string;
  wordLength: number;
  maxGuesses: number;
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

// Common 5-letter words for easy, 6 for medium, 7 for hard
const WORDS: Record<number, string[]> = {
  5: ["BRAIN","CHESS","FLAME","GRACE","LIGHT","LOGIC","MUSIC","PLANT","POWER","RIVER",
      "SMART","SPACE","STORM","THINK","TIGER","WATCH","WORLD","EARTH","HEART","STONE",
      "CLOUD","DREAM","FIELD","FROST","GLASS","NIGHT","OCEAN","PRIDE","QUEEN","ROYAL",
      "SCOUT","SHOUT","SLIDE","SMILE","SMOKE","SNAIL","SOLAR","SOLID","SOLVE","SPARK",
      "SPEED","SPELL","SPINE","SPITE","SPLIT","SPOKE","SPOON","SPORT","SPRAY","SQUAD"],
  6: ["BRIDGE","CASTLE","DRAGON","FINGER","FLOWER","GARDEN","MIRROR","NATURE","ORANGE",
      "PALACE","PLANET","RABBIT","SHADOW","SILVER","SPRING","STREAM","TEMPLE","FRIEND",
      "GROUND","HONEST","HUNTER","ISLAND","JUNGLE","KNIGHT","LEMON","MARKET","MASTER",
      "MENTAL","MOTHER","MUSCLE","MYSTIC","NARROW","NEEDLE","OBJECT","OYSTER","PARROT",
      "PENCIL","PHRASE","PIRATE","PLANET","PLAYER","PLEASE","POCKET","PORTAL","POWDER"],
  7: ["CAPTAIN","COURAGE","DIAMOND","DOLPHIN","EVENING","JOURNEY","KITCHEN","LOGICAL",
      "MAGICAL","MIRACLE","MORNING","PATTERN","PERFECT","SPARKLE","WARRIOR","WELCOME",
      "ANCIENT","BALANCE","BLANKET","CABINET","CHAPTER","CIRCUIT","CLIMATE","COLLECT",
      "COMFORT","COMPOSE","CONNECT","CONVERT","CORRECT","COUNTRY","CULTURE","CURRENT",
      "CURTAIN","DESTINY","DIGITAL","DISPLAY","DISTANT","DRIVING","EXPLORE","FACTORY"],
};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export function generateWordleBoard(seed:string, difficulty:"easy"|"medium"|"hard"): WordleBoard {
  const wordLength = difficulty==="easy"?5:difficulty==="medium"?6:7;
  const maxGuesses = difficulty==="easy"?6:difficulty==="medium"?6:5;
  const rng = mulberry32(seedToNum(seed));
  const pool = WORDS[wordLength] ?? WORDS[5];
  const answer = pool[Math.floor(rng()*pool.length)];
  return { answer, wordLength, maxGuesses, seed, difficulty };
}

export type LetterResult = "correct"|"present"|"absent";

export function scoreGuess(guess: string, answer: string): LetterResult[] {
  const result: LetterResult[] = Array(guess.length).fill("absent");
  const answerArr = answer.split("");
  const used = Array(answer.length).fill(false);

  // First pass: correct positions
  for (let i=0; i<guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  // Second pass: present but wrong position
  for (let i=0; i<guess.length; i++) {
    if (result[i] === "correct") continue;
    for (let j=0; j<answer.length; j++) {
      if (!used[j] && guess[i] === answer[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }
  return result;
}

export function isValidGuess(guess: string, wordLength: number): boolean {
  return guess.length === wordLength && /^[A-Z]+$/.test(guess);
}
