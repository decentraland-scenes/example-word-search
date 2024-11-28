import { randomArrayElement } from "../utils"

type Directions = ("left" | "right" | "up" | "down" | "left_down" | "left_up" | "right_down" | "right_up")[]

export type WordSearchTemplate = {
    words: string[],
    maxWords: number,
    active: Directions
    inactive: Directions
}

export function getRandomTemplate(level: number): WordSearchTemplate
{
    return {
        words: randomArrayElement(WORDS_TEMPLATES), 
        maxWords: (level < MAX_WORDS_PER_LEVEL.length)? MAX_WORDS_PER_LEVEL[level]: MAX_WORDS_PER_LEVEL[MAX_WORDS_PER_LEVEL.length-1], 
        active: (level < DIRECTIONS_PER_LEVEL.length)? DIRECTIONS_PER_LEVEL[level].active: DIRECTIONS_PER_LEVEL[DIRECTIONS_PER_LEVEL.length-1].active, 
        inactive: (level < DIRECTIONS_PER_LEVEL.length)? DIRECTIONS_PER_LEVEL[level].inactive: DIRECTIONS_PER_LEVEL[DIRECTIONS_PER_LEVEL.length-1].inactive, 
    }
}

export function getMaxPossibleWords() {
    return MAX_WORDS_PER_LEVEL[MAX_WORDS_PER_LEVEL.length-1]
}

const LVL1_DIRECTIONS: {active: Directions,inactive: Directions} = {
    active: ["left", "down"],
    inactive: ["right", "up", "left_down", "left_up", "right_down", "right_up"]
}
const LVL2_DIRECTIONS: {active: Directions,inactive: Directions} = {
    active: ["left", "down", "left_down"],
    inactive: ["right", "up", "left_up", "right_down", "right_up"]
}
const LVL3_DIRECTIONS: {active: Directions,inactive: Directions} = {
    active: ["left", "left_down", "right", "down", "up"],
    inactive: ["left_up", "right_down", "right_up"]
}
const LVL4_DIRECTIONS: {active: Directions,inactive: Directions} = {
    active: ["left", "right", "down", "up", "left_down", "left_up"],
    inactive: ["right_down", "right_up"]
}
const LVL5_DIRECTIONS: {active: Directions,inactive: Directions} = {
    active: ["left", "up","right", "down", "left_down", "left_up", "right_down", "right_up"],
    inactive: []
}

const DIRECTIONS_PER_LEVEL = [LVL1_DIRECTIONS, LVL2_DIRECTIONS, LVL3_DIRECTIONS, LVL4_DIRECTIONS, LVL5_DIRECTIONS]
const MAX_WORDS_PER_LEVEL = [10, 12, 14, 16, 18]


const WORDS_TEMPLATES: string[][] = [
    //Reptiles
    [ "COBRA", "PYTHON", "ANACONDA", "CONSTRICTOR", "VIPER", "IGUANA", "GECKO", "LIZARD", "CHAMELEON", 
        "SKINK", "TORTOISE", "TURTLE", "CROCODILE", "ALLIGATOR", "CAIMAN", "BOA", "GHARIAL", "KOMODO"],
    //Birds
    [ "SPARROW", "ROBIN", "CARDINAL", "FINCH", "NIGHTINGALE", "BLACKBIRD", "SWALLOW", "WARBLER", "WREN", 
        "EAGLE", "HAWK", "FALCON", "OWL", "VULTURE", "OSPREY", "KESTREL", "HARRIER", "DUCK", "SWAN", "GOOSE", 
        "PELICAN", "HERON", "FLAMINGO", "STORK", "ALBATROSS", "SEAGULL", "PUFFIN", "TERN", "CORMORANT", 
        "SHEARWATER", "GANNET", "PETREL", "PARROT", "OSTRICH", "EMU", "PENGUIN", "KIWI", "TURKEY", "DODO", 
        "WOODPECKER", "PEACOCK", "TOUCAN",],
    //Water Animals
    [ "SHARK", "TUNA", "CLOWNFISH", "ANGLERFISH", "DOLPHIN", "WHALE", "SEAL", "OTTER", "MANATEE", 
        "TURTLE", "IGUANA", "OCTOPUS", "SQUID", "JELLYFISH", "STARFISH", "URCHIN", "CORAL", "CRAB", "LOBSTER", 
        "SHRIMP", "KRILL", "SALMON", "CATFISH", "TROUT", "PIRANHA", "PIKE", "CROCODILE", "FROG", "SALAMANDER", 
        "NEWT", "PLATYPUS", "EEL",],
    //Food
    ["COOKIE", "TOAST", "BAGUETTE", "CHOCOLATE", "SPAGHETTI", "EGG", "CROISSANT", 
        "CEREAL", "CAKE", "PIE", "BROWNIE", "COOKIES", "DONUTS", "CHEESECAKE", 
        "PUDDING", "CUSTARD", "TIRAMISU", "MACARONS", "BAGEL", "MUFFIN", "PITA", "SOURDOUGH", "FOCACCIA", "TORTILLA", 
        "LENTILS", "CHICKPEAS", "BEANS", "PEAS", "SOYBEANS", "MILK", "CHEESE", "YOGURT", "BUTTER", "CREAM", "MOZZARELLA", 
        "SALMON", "TUNA", "SHRIMP", "CRAB", "LOBSTER", "MUSSELS", "OYSTERS", "SARDINES", "COD", "SCALLOPS", "CHICKEN", 
        "BEEF", "PORK", "LAMB", "TURKEY", "DUCK", "GOAT", "VENISON", "RABBIT", "BACON", "RICE",],
    //Fruits & Vegetables
    [ "APPLE", "BANANA", "ORANGE", "MANGO", "STRAWBERRY", "GRAPE", "PINEAPPLE", "KIWI", "BLUEBERRY", 
        "WATERMELON", "PEACH", "PEAR", "CHERRY", "RASPBERRY", "PAPAYA", "POMEGRANATE", "CANTALOUPE", 
        "FIG", "LEMON", "AVOCADO", "CARROT", "BROCCOLI", "SPINACH", "KALE", "CUCUMBER", "TOMATO", 
        "POTATO", "ONION", "EGGPLANT",],
    //Capitals
    ["KABUL", "LUANDA", "CANBERRA", "YEREVAN", "VIENNA", "NASSAU", "MISK", "BRUSSELS", "LUXEMBOURG", "BRASILIA", 
        "SOFIA", "OTTAWA", "SANTIAGO", "BEIJING", "BOGOTA", "ZAGREB", "HAVANA", "PRAGUE", "COPENHAGEN", "ROSEAU",
        "QUITO", "CAIRO", "TALLINN", "HELSINKI", "PARIS", "BANJUL", "BERLIN", "ACCRA", "ATHENS", "BUDAPEST", 
        "REYKJAVIK", "JAKARTA", "TEHRAN", "DUBLIN", "ROME", "TOKYO", "AMMAN", "ASTANA", "NAIROBI", "RIGA", 
        "TRIPOLI", "ANTANANARIVO", "MONACO", "ULAANBAATAR", "RABAT", "MAPUTO", "AMSTERDAM", "NIAMEY", "OSLO", 
        "ISLAMABAD", "JERUSALEM", "LIMA", "LISBON", "MOSCOW", "DAKAR", "SEOUL", "MADRID", "BERN", "DAMASCUS", 
        "TAIPEI", "BANGKOK", "ANKARA", "KIEV", "LONDON", "WASHINGTON", "CARACAS", "HANOI", ],

    //Countries
    ["BRAZIL", "FRANCE", "GERMANY", "SPAIN", "CHINA", "INDIA", "AUSTRALIA", "RUSSIA", "VENEZUELA", "ARGENTINA", 
        "EGYPT", "PORTUGAL", "PERU", "YEMEN", "ALBANIA", "ANDORRA", "AUSTRIA", "BARBADOS", "BELGIUM", "BOLIVIA", 
        "BULGARIA", "CANADA", "CHILE", "CUBA", "DENMARK", "ECUADOR", "ESTONIA", "ETHIOPIA", "FINLAND", "GEORGIA", 
        "GREECE", "GHANA", "GUATEMALA", "GUINEA", "HAITI", "HONDURAS", "HUNGARY", "ICELAND", "INDONESIA", "IRAN", 
        "IRAQ", "IRELAND", "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "KENYA", "KIRIBATI", "KUWAIT", "LATVIA", 
        "LIBYA", "LITHUANIA", "LUXEMBOURG", "MADAGASCAR", "MALDIVES", "MALTA", "MEXICO", "MOLDOVA", "MONACO", "MONGOLIA", 
        "MOROCCO", "NEPAL", "NETHERLANDS", "NICARAGUA", "NIGERIA", "NORWAY", "PAKISTAN", "PANAMA", "PARAGUAY", 
        "POLAND", "QATAR", "ROMANIA", "RWANDA", "SENEGAL", "SINGAPORE", "SOMALIA", "SUDAN", "SWEDEN", "TAIWAN", 
        "TURKEY", "UGANDA", "UKRAINE", "URUGUAY", "VIETNAM"],
    //Mythology
    [ "ZEUS", "ODIN", "RA", "VISHNU", "SHIVA", "ANUBIS", "FREYJA", "ATHENA", "SKADI", "DURGA", "HADES", "QUETZALCOATL", 
        "SOBEK", "SHIVA", "ARTEMIS", "SEKHMET", "THOR", "HERMES", "GANESHA", "ARES ", "ACHILLES", "AGNI", "AMATERASU", 
        "ANHUR", "APHRODITE", "APOLLO", "ARACHNE", "ARTIO", "ATLAS", "BACCHUS", "BASTET", "CAMAZOTZ", "CABRAKAN", "CERBERUS", 
        "CHAAC", "CHARON", "CHARYBDIS", "CHIRON", "CHRONOS", "CUPID", "DISCORDIA", "FAFNIR", "FENRIR", "SYLVANUS", "GEB",
        "GILGAMESH", "HEIMDALLR", "HELL", "HERA", "HERCULES", "HORUS", "ISHTAR", "JANUS", "KALI", "JORMUNGANDR", "KHEPRI",
        "KUZEMBO", "LOKI", "MAUI", "MEDUSA", "MERCURY", "NEMESIS", "NIKE", "OSIRIS", "PERSEPHONE", "POSEIDON", "RAIJIN",
        "RAMA", "RAVANA", "SCYLLA", "SERQET", "SET", "THANATOS", "THOTH", "TYR", "ULLR", "VULCAN", "YMIR", "VAMANA"],
    //Scientist
    [ "CURIE", "NEWTON", "DARWIN", "TESLA", "FRANKLIN", "HAWKING", "GALILEI", "GOODALL", "FEYNMAN", "PASTEUR", "FARADAY", "MCCLINTOCK", 
        "BOHR", "LOVELACE", "MENDELEEV", "SAGAN", "COPERNICUS", "HOOKE", "MENDEL", "FREUD", "EINSTEIN", "CARSON", "TURING", "TYSON", 
        "JOHNSON", "GAUSS", "HUBBLE", "KEPLER", "LEAVITT", "COUSTEAU", "ECCLES", "FLEMING", "BUNSEN", "GIBBS"],
    //Colors
    [ "RED", "BLUE", "YELLOW", "GREEN", "ORANGE", "PURPLE", "WHITE", "BLACK", "GRAY", "BROWN", "BEIGE", "IVORY", "PASTEL", "LAVENDER", 
        "PEACH", "MAROON", "CORAL", "GOLD", "AMBER", "SCARLET", "COPPER", "TEAL", "TURQUOISE", "EMERALD", "SAPPHIRE", "INDIGO", "OLIVE", 
        "TERRACOTTA", "SAND", "KHAKI", "RUST", "FUCHSIA", "SILVER", "BRONZE", "PLATINUM",],
    //Planets
    [ "MERCURY", "VENUS", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO", "ERIS", "HAUMEA", "MAKEMAKE", 
        "CERES", "MOON", "PHOBOS", "DEIMOS", "IO", "EUROPA", "GANYMEDE", "CALLISTO", "TITAN", "ENCELADUS", "MIMAS", 
        "RHEA", "IAPETUS", "DIONE",]
]


