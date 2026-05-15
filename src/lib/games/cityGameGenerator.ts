export type CityGameBoard = {
  answer: string;
  country: string;
  continent: string;
  flag: string;
  hint1: string;
  hint2: string;
  wordLength: number;
  maxGuesses: number;
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};
export type LetterResult = "correct"|"present"|"absent";

const CITIES = [
  {name:"PARIS",    country:"France",      continent:"Europe",     flag:"🇫🇷", hint1:"City of Light",           hint2:"Has the Eiffel Tower"},
  {name:"TOKYO",    country:"Japan",       continent:"Asia",       flag:"🇯🇵", hint1:"World's most populous city", hint2:"Capital of Japan"},
  {name:"DUBAI",    country:"UAE",         continent:"Asia",       flag:"🇦🇪", hint1:"City of skyscrapers",      hint2:"Burj Khalifa is here"},
  {name:"ROME",     country:"Italy",       continent:"Europe",     flag:"🇮🇹", hint1:"Eternal City",             hint2:"Home of the Colosseum"},
  {name:"CAIRO",    country:"Egypt",       continent:"Africa",     flag:"🇪🇬", hint1:"Near the Pyramids",        hint2:"Largest city in Africa"},
  {name:"DELHI",    country:"India",       continent:"Asia",       flag:"🇮🇳", hint1:"30 million residents",     hint2:"Capital of India"},
  {name:"LONDON",   country:"UK",          continent:"Europe",     flag:"🇬🇧", hint1:"Big Ben is here",          hint2:"Thames river city"},
  {name:"SYDNEY",   country:"Australia",   continent:"Oceania",    flag:"🇦🇺", hint1:"Famous opera house",       hint2:"Largest Australian city"},
  {name:"BERLIN",   country:"Germany",     continent:"Europe",     flag:"🇩🇪", hint1:"Reunification city",       hint2:"Capital of Germany"},
  {name:"MADRID",   country:"Spain",       continent:"Europe",     flag:"🇪🇸", hint1:"High altitude capital",    hint2:"Heart of Spain"},
  {name:"MOSCOW",   country:"Russia",      continent:"Europe",     flag:"🇷🇺", hint1:"Red Square is here",       hint2:"Capital of Russia"},
  {name:"SEOUL",    country:"S. Korea",    continent:"Asia",       flag:"🇰🇷", hint1:"K-pop capital",            hint2:"10 million residents"},
  {name:"NAIROBI",  country:"Kenya",       continent:"Africa",     flag:"🇰🇪", hint1:"Safari gateway city",      hint2:"Capital of Kenya"},
  {name:"ATHENS",   country:"Greece",      continent:"Europe",     flag:"🇬🇷", hint1:"Birthplace of democracy",  hint2:"Acropolis city"},
  {name:"LISBON",   country:"Portugal",    continent:"Europe",     flag:"🇵🇹", hint1:"City of seven hills",      hint2:"Western edge of Europe"},
  {name:"VIENNA",   country:"Austria",     continent:"Europe",     flag:"🇦🇹", hint1:"Music capital",            hint2:"Danube river city"},
  {name:"TORONTO",  country:"Canada",      continent:"N.America",  flag:"🇨🇦", hint1:"CN Tower is here",         hint2:"Largest Canadian city"},
  {name:"BANGKOK",  country:"Thailand",    continent:"Asia",       flag:"🇹🇭", hint1:"Temple of the Emerald Buddha", hint2:"Southeast Asian capital"},
  {name:"CHICAGO",  country:"USA",         continent:"N.America",  flag:"🇺🇸", hint1:"Windy City",               hint2:"Lake Michigan shore"},
  {name:"MUMBAI",   country:"India",       continent:"Asia",       flag:"🇮🇳", hint1:"Bollywood capital",        hint2:"Financial hub of India"},
  {name:"ISTANBUL", country:"Turkey",      continent:"Europe/Asia",flag:"🇹🇷", hint1:"Spans two continents",     hint2:"Bosphorus strait city"},
  {name:"JAKARTA",  country:"Indonesia",   continent:"Asia",       flag:"🇮🇩", hint1:"Being replaced as capital",hint2:"Most populous city in SEA"},
  {name:"LIMA",     country:"Peru",        continent:"S.America",  flag:"🇵🇪", hint1:"Pacific coast capital",    hint2:"Gateway to Machu Picchu"},
  {name:"LAGOS",    country:"Nigeria",     continent:"Africa",     flag:"🇳🇬", hint1:"Africa's largest city",    hint2:"Atlantic coast Nigeria"},
  {name:"OSLO",     country:"Norway",      continent:"Europe",     flag:"🇳🇴", hint1:"Fjord city",               hint2:"Nobel Peace Prize city"},
];

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export function generateCityGame(seed:string, difficulty:"easy"|"medium"|"hard"): CityGameBoard {
  const pool = difficulty==="easy"
    ? CITIES.filter(c=>c.name.length<=5)
    : difficulty==="medium"
    ? CITIES.filter(c=>c.name.length>=5&&c.name.length<=6)
    : CITIES.filter(c=>c.name.length>=6);
  const rng = mulberry32(seedToNum(seed));
  const city = pool[Math.floor(rng()*pool.length)] ?? CITIES[0];
  return {
    answer: city.name, country: city.country, continent: city.continent,
    flag: city.flag, hint1: city.hint1, hint2: city.hint2,
    wordLength: city.name.length,
    maxGuesses: difficulty==="easy"?7:difficulty==="medium"?6:5,
    seed, difficulty,
  };
}

export function scoreGuess(guess:string, answer:string): LetterResult[] {
  const result:LetterResult[] = Array(guess.length).fill("absent");
  const used = Array(answer.length).fill(false);
  for(let i=0;i<guess.length;i++) if(guess[i]===answer[i]){result[i]="correct";used[i]=true;}
  for(let i=0;i<guess.length;i++){
    if(result[i]==="correct")continue;
    for(let j=0;j<answer.length;j++){
      if(!used[j]&&guess[i]===answer[j]){result[i]="present";used[j]=true;break;}
    }
  }
  return result;
}
