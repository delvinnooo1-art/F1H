/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * F1 2026 Core Data Constants
 * Separated to avoid circular dependencies.
 */

export interface DriverAsset {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
  image: string;
  suit: string;
  helmet: string;
  color: string;
}

export interface TeamAsset {
  id: string;
  name: string;
  color: string;
  carImage: string;
  logo: string;
  secondaryColor: string;
}

export interface TrackAsset {
  id: string;
  shortName: string;
  fullName: string;
  location: string;
  countryCode: string;
  mapImage: string;
  heroImage: string;
  nightImage?: string;
  sectorsImage?: string;
  pitlaneImage?: string;
  flag: string;
  timezone: string;
}

export const TRACK_DATABASE: Record<string, TrackAsset> = {
  "canada_gp_2026": {
    id: "canada_gp_2026",
    shortName: "Montreal",
    fullName: "Circuit Gilles Villeneuve",
    location: "Montreal, Canada",
    countryCode: "CA",
    mapImage: "https://cdn.racehub.live/2026/maps/canada-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/canada.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/canada.jpg", 
    sectorsImage: "https://cdn.racehub.live/2026/tracks/placeholder.jpg",
    flag: "🇨🇦",
    timezone: "America/Toronto"
  },
  "monaco_gp_2026": {
    id: "monaco_gp_2026",
    shortName: "Monaco",
    fullName: "Circuit de Monaco",
    location: "Monte Carlo, Monaco",
    countryCode: "MC",
    mapImage: "https://cdn.racehub.live/2026/maps/monaco-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/monaco.jpg",
    flag: "🇲🇨",
    timezone: "Europe/Monaco"
  },
  "silverstone_gp_2026": {
    id: "silverstone_gp_2026",
    shortName: "Silverstone",
    fullName: "Silverstone Circuit",
    location: "Silverstone, UK",
    countryCode: "GB",
    mapImage: "https://cdn.racehub.live/2026/maps/great-britain-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/great-britain.jpg",
    flag: "🇬🇧",
    timezone: "Europe/London"
  },
  "italian_gp_2026": {
    id: "italian_gp_2026",
    shortName: "Monza",
    fullName: "Autodromo Nazionale Monza",
    location: "Monza, Italy",
    countryCode: "IT",
    mapImage: "https://cdn.racehub.live/2026/maps/italy-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/italy.jpg",
    flag: "🇮🇹",
    timezone: "Europe/Rome"
  },
  "las_vegas_gp_2026": {
    id: "las_vegas_gp_2026",
    shortName: "Las Vegas",
    fullName: "Las Vegas Strip Circuit",
    location: "Las Vegas, USA",
    countryCode: "US",
    mapImage: "https://cdn.racehub.live/2026/maps/las-vegas-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/las-vegas.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/las-vegas.jpg",
    flag: "🇺🇸",
    timezone: "America/Los_Angeles"
  },
  "bahrain_gp_2026": {
    id: "bahrain_gp_2026",
    shortName: "Sakhir",
    fullName: "Bahrain International Circuit",
    location: "Sakhir, Bahrain",
    countryCode: "BH",
    mapImage: "https://cdn.racehub.live/2026/maps/bahrain-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/bahrain.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/bahrain.jpg",
    flag: "🇧🇭",
    timezone: "Asia/Bahrain"
  },
  "jeddah_gp_2026": {
    id: "jeddah_gp_2026",
    shortName: "Jeddah",
    fullName: "Jeddah Corniche Circuit",
    location: "Jeddah, Saudi Arabia",
    countryCode: "SA",
    mapImage: "https://cdn.racehub.live/2026/maps/saudi-arabia-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/saudi-arabia.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/saudi-arabia.jpg",
    flag: "🇸🇦",
    timezone: "Asia/Riyadh"
  },
  "australian_gp_2026": {
    id: "australian_gp_2026",
    shortName: "Melbourne",
    fullName: "Albert Park Circuit",
    location: "Melbourne, Australia",
    countryCode: "AU",
    mapImage: "https://cdn.racehub.live/2026/maps/australia-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/australia.jpg",
    flag: "🇦🇺",
    timezone: "Australia/Melbourne"
  },
  "japanese_gp_2026": {
    id: "japanese_gp_2026",
    shortName: "Suzuka",
    fullName: "Suzuka International Racing Course",
    location: "Suzuka, Japan",
    countryCode: "JP",
    mapImage: "https://cdn.racehub.live/2026/maps/japan-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/japan.jpg",
    flag: "🇯🇵",
    timezone: "Asia/Tokyo"
  },
  "chinese_gp_2026": {
    id: "chinese_gp_2026",
    shortName: "Shanghai",
    fullName: "Shanghai International Circuit",
    location: "Shanghai, China",
    countryCode: "CN",
    mapImage: "https://cdn.racehub.live/2026/maps/china-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/china.jpg",
    flag: "🇨🇳",
    timezone: "Asia/Shanghai"
  },
  "miami_gp_2026": {
    id: "miami_gp_2026",
    shortName: "Miami",
    fullName: "Miami International Autodrome",
    location: "Miami, USA",
    countryCode: "US",
    mapImage: "https://cdn.racehub.live/2026/maps/miami-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/miami.jpg",
    flag: "🇺🇸",
    timezone: "America/New_York"
  },
  "emilia_romagna_gp_2026": {
    id: "emilia_romagna_gp_2026",
    shortName: "Imola",
    fullName: "Autodromo Internazionale Enzo e Dino Ferrari",
    location: "Imola, Italy",
    countryCode: "IT",
    mapImage: "https://cdn.racehub.live/2026/maps/emilia-romagna-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/emilia-romagna.jpg",
    flag: "🇮🇹",
    timezone: "Europe/Rome"
  },
  "spanish_gp_2026": {
    id: "spanish_gp_2026",
    shortName: "Barcelona",
    fullName: "Circuit de Barcelona-Catalunya",
    location: "Montmeló, Spain",
    countryCode: "ES",
    mapImage: "https://cdn.racehub.live/2026/maps/spain-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/spain.jpg",
    flag: "🇪🇸",
    timezone: "Europe/Madrid"
  },
  "austrian_gp_2026": {
    id: "austrian_gp_2026",
    shortName: "Spielberg",
    fullName: "Red Bull Ring",
    location: "Spielberg, Austria",
    countryCode: "AT",
    mapImage: "https://cdn.racehub.live/2026/maps/austria-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/austria.jpg",
    flag: "🇦🇹",
    timezone: "Europe/Vienna"
  },
  "hungarian_gp_2026": {
    id: "hungarian_gp_2026",
    shortName: "Hungaroring",
    fullName: "Hungaroring",
    location: "Mogyoród, Hungary",
    countryCode: "HU",
    mapImage: "https://cdn.racehub.live/2026/maps/hungary-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/hungary.jpg",
    flag: "🇭🇺",
    timezone: "Europe/Budapest"
  },
  "belgian_gp_2026": {
    id: "belgian_gp_2026",
    shortName: "Spa-Francorchamps",
    fullName: "Circuit de Spa-Francorchamps",
    location: "Stavelot, Belgium",
    countryCode: "BE",
    mapImage: "https://cdn.racehub.live/2026/maps/belgium-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/belgium.jpg",
    flag: "🇧🇪",
    timezone: "Europe/Brussels"
  },
  "dutch_gp_2026": {
    id: "dutch_gp_2026",
    shortName: "Zandvoort",
    fullName: "Circuit Zandvoort",
    location: "Zandvoort, Netherlands",
    countryCode: "NL",
    mapImage: "https://cdn.racehub.live/2026/maps/netherlands-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/netherlands.jpg",
    flag: "🇳🇱",
    timezone: "Europe/Amsterdam"
  },
  "azerbaijan_gp_2026": {
    id: "azerbaijan_gp_2026",
    shortName: "Baku",
    fullName: "Baku City Circuit",
    location: "Baku, Azerbaijan",
    countryCode: "AZ",
    mapImage: "https://cdn.racehub.live/2026/maps/baku-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/baku.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/baku.jpg",
    flag: "🇦🇿",
    timezone: "Asia/Baku"
  },
  "singapore_gp_2026": {
    id: "singapore_gp_2026",
    shortName: "Singapore",
    fullName: "Marina Bay Street Circuit",
    location: "Marina Bay, Singapore",
    countryCode: "SG",
    mapImage: "https://cdn.racehub.live/2026/maps/singapore-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/singapore.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/singapore.jpg",
    flag: "🇸🇬",
    timezone: "Asia/Singapore"
  },
  "united_states_gp_2026": {
    id: "united_states_gp_2026",
    shortName: "Austin",
    fullName: "Circuit of the Americas",
    location: "Austin, USA",
    countryCode: "US",
    mapImage: "https://cdn.racehub.live/2026/maps/usa-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/usa.jpg",
    flag: "🇺🇸",
    timezone: "America/Chicago"
  },
  "mexico_city_gp_2026": {
    id: "mexico_city_gp_2026",
    shortName: "Mexico City",
    fullName: "Autódromo Hermanos Rodríguez",
    location: "Mexico City, Mexico",
    countryCode: "MX",
    mapImage: "https://cdn.racehub.live/2026/maps/mexico-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/mexico.jpg",
    flag: "🇲🇽",
    timezone: "America/Mexico_City"
  },
  "sao_paulo_gp_2026": {
    id: "sao_paulo_gp_2026",
    shortName: "São Paulo",
    fullName: "Autódromo José Carlos Pace",
    location: "São Paulo, Brazil",
    countryCode: "BR",
    mapImage: "https://cdn.racehub.live/2026/maps/brazil-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/brazil.jpg",
    flag: "🇧🇷",
    timezone: "America/Sao_Paulo"
  },
  "qatar_gp_2026": {
    id: "qatar_gp_2026",
    shortName: "Lusail",
    fullName: "Lusail International Circuit",
    location: "Lusail, Qatar",
    countryCode: "QA",
    mapImage: "https://cdn.racehub.live/2026/maps/qatar-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/qatar.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/qatar.jpg",
    flag: "🇶🇦",
    timezone: "Asia/Qatar"
  },
  "abu_dhabi_gp_2026": {
    id: "abu_dhabi_gp_2026",
    shortName: "Abu Dhabi",
    fullName: "Yas Marina Circuit",
    location: "Abu Dhabi, UAE",
    countryCode: "AE",
    mapImage: "https://cdn.racehub.live/2026/maps/abu-dhabi-circuit.png",
    heroImage: "https://cdn.racehub.live/2026/tracks/abu-dhabi.jpg",
    nightImage: "https://cdn.racehub.live/2026/tracks/abu-dhabi.jpg",
    flag: "🇦🇪",
    timezone: "Asia/Dubai"
  }

};

export const TEAMS_2026: Record<string, TeamAsset> = {
  "RED BULL": {
    id: "red_bull",
    name: "Oracle Red Bull Racing",
    color: "#3671C6",
    secondaryColor: "#F3212E",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "FERRARI": {
    id: "ferrari",
    name: "Scuderia Ferrari HP",
    color: "#E80020",
    secondaryColor: "#FFFFFF",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "MCLAREN": {
    id: "mclaren",
    name: "McLaren Formula 1 Team",
    color: "#FF8000",
    secondaryColor: "#000000",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "MERCEDES": {
    id: "mercedes",
    name: "Mercedes-AMG PETRONAS F1 Team",
    color: "#27F4D2",
    secondaryColor: "#000000",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "ASTON MARTIN": {
    id: "aston_martin",
    name: "Aston Martin Aramco F1 Team",
    color: "#229977",
    secondaryColor: "#CEDC00",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "ALPINE": {
    id: "alpine",
    name: "BWT Alpine F1 Team",
    color: "#0093CC",
    secondaryColor: "#FF66C4",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "WILLIAMS": {
    id: "williams",
    name: "Williams Racing",
    color: "#00A0DE",
    secondaryColor: "#FFFFFF",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "HAAS": {
    id: "haas",
    name: "MoneyGram Haas F1 Team",
    color: "#FFFFFF",
    secondaryColor: "#D40000",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "SAUBER": {
    id: "sauber",
    name: "Stake F1 Team Kick Sauber",
    color: "#52E252",
    secondaryColor: "#000000",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  },
  "RB": {
    id: "rb",
    name: "Visa Cash App RB F1 Team",
    color: "#6692FF",
    secondaryColor: "#FFFFFF",
    logo: "https://cdn.racehub.live/2026/teams/placeholder.png",
    carImage: "https://cdn.racehub.live/2026/teams/placeholder.png"
  }
};

export const DRIVERS_2026: Record<string, DriverAsset> = {
  "1": {
    id: "max_verstappen",
    firstName: "Max",
    lastName: "Verstappen",
    team: "RED BULL",
    color: "#3671C6",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "16": {
    id: "charles_leclerc",
    firstName: "Charles",
    lastName: "Leclerc",
    team: "FERRARI",
    color: "#E80020",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "4": {
    id: "lando_norris",
    firstName: "Lando",
    lastName: "Norris",
    team: "MCLAREN",
    color: "#FF8000",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "44": {
    id: "lewis_hamilton",
    firstName: "Lewis",
    lastName: "Hamilton",
    team: "FERRARI",
    color: "#E80020",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "81": {
    id: "oscar_piastri",
    firstName: "Oscar",
    lastName: "Piastri",
    team: "MCLAREN",
    color: "#FF8000",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "63": {
    id: "george_russell",
    firstName: "George",
    lastName: "Russell",
    team: "MERCEDES",
    color: "#27F4D2",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "55": {
    id: "carlos_sainz",
    firstName: "Carlos",
    lastName: "Sainz",
    team: "WILLIAMS",
    color: "#00A0DE",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "14": {
    id: "fernando_alonso",
    firstName: "Fernando",
    lastName: "Alonso",
    team: "ASTON MARTIN",
    color: "#229977",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "12": {
    id: "kimi_antonelli",
    firstName: "Kimi",
    lastName: "Antonelli",
    team: "MERCEDES",
    color: "#27F4D2",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "87": {
    id: "ollie_bearman",
    firstName: "Ollie",
    lastName: "Bearman",
    team: "HAAS",
    color: "#FFFFFF",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "10": {
    id: "pierre_gasly",
    firstName: "Pierre",
    lastName: "Gasly",
    team: "ALPINE",
    color: "#0093CC",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "30": {
    id: "liam_lawson",
    firstName: "Liam",
    lastName: "Lawson",
    team: "RB",
    color: "#6692FF",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "43": {
    id: "franco_colapinto",
    firstName: "Franco",
    lastName: "Colapinto",
    team: "WILLIAMS",
    color: "#00A0DE",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  }
,
  "0": {
    id: "gabriel_bortoleto",
    firstName: "Gabriel",
    lastName: "Bortoleto",
    team: "SAUBER",
    color: "#52E252",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "2": {
    id: "logan_sargeant",
    firstName: "Logan",
    lastName: "Sargeant",
    team: "WILLIAMS",
    color: "#00A0DE",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "3": {
    id: "daniel_ricciardo",
    firstName: "Daniel",
    lastName: "Ricciardo",
    team: "RB",
    color: "#6692FF",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "5": {
    id: "jack_doohan",
    firstName: "Jack",
    lastName: "Doohan",
    team: "ALPINE",
    color: "#0093CC",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "11": {
    id: "sergio_perez",
    firstName: "Sergio",
    lastName: "Perez",
    team: "RED BULL",
    color: "#3671C6",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "18": {
    id: "lance_stroll",
    firstName: "Lance",
    lastName: "Stroll",
    team: "ASTON MARTIN",
    color: "#229977",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "20": {
    id: "kevin_magnussen",
    firstName: "Kevin",
    lastName: "Magnussen",
    team: "HAAS",
    color: "#FFFFFF",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "22": {
    id: "yuki_tsunoda",
    firstName: "Yuki",
    lastName: "Tsunoda",
    team: "RB",
    color: "#6692FF",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "23": {
    id: "alexander_albon",
    firstName: "Alexander",
    lastName: "Albon",
    team: "WILLIAMS",
    color: "#00A0DE",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "24": {
    id: "zhou_guanyu",
    firstName: "Zhou",
    lastName: "Guanyu",
    team: "SAUBER",
    color: "#52E252",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "27": {
    id: "nico_hulkenberg",
    firstName: "Nico",
    lastName: "Hulkenberg",
    team: "SAUBER",
    color: "#52E252",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "31": {
    id: "esteban_ocon",
    firstName: "Esteban",
    lastName: "Ocon",
    team: "HAAS",
    color: "#FFFFFF",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "77": {
    id: "valtteri_bottas",
    firstName: "Valtteri",
    lastName: "Bottas",
    team: "SAUBER",
    color: "#52E252",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "98": {
    id: "arvid_lindblad",
    firstName: "Arvid",
    lastName: "Lindblad",
    team: "RED BULL",
    color: "#3671C6",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },
  "99": {
    id: "isack_hadjar",
    firstName: "Isack",
    lastName: "Hadjar",
    team: "RED BULL",
    color: "#3671C6",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  }
};