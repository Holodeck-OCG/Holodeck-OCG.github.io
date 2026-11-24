/**
 * Synergy Dictionary - Shared module for card search synergy logic
 * Used by: index.js, card-library.js, deckbuilder.js, quiz.js
 */

export const synergyDictionary = {
  // ── GROUPS & GENERATIONS ──
  "gen 0": ["sora", "robocosan", "azki", "miko", "suisei", "gen 0", "0th gen"],
  "gen 1": ["mel", "fubuki", "matsuri", "aki", "haato", "gen 1", "1st gen"],
  "gen 2": ["aqua", "shion", "ayame", "choco", "subaru", "gen 2", "2nd gen"],
  "gamers": ["fubuki", "mio", "okayu", "korone", "gamers"],
  "fantasy": ["pekora", "flare", "noel", "marine", "fantasy"],
  "gen 4": ["kanata", "watame", "towa", "luna", "gen 4", "4th gen"],
  "nepolabo": ["lamy", "nene", "botan", "polka", "nepolabo", "gen 5", "5th gen"],
  "holox": ["la+", "lui", "koyori", "chloe", "iroha", "holox", "gen 6", "6th gen"],

  "holo id": ["moona", "risu", "iofi", "reine", "ollie", "anya", "kobo", "kaela", "zeta", "holo id", "#id"],
  "area 15": ["moona", "risu", "iofi", "area 15", "id gen 1"],
  "holoro": ["ollie", "anya", "reine", "holoro", "id gen 2"],
  "holoh3ro": ["zeta", "kaela", "kobo", "holoh3ro", "h3ro", "id gen 3"],

  "holo en": ["calliope", "kiara", "ina'nis", "gura", "amelia", "irys", "fauna", "kronii", "mumei", "baelz", "shiori", "bijou", "nerissa", "fuwawa", "mococo", "elizabeth", "gigi", "cecilia", "raora", "holo en", "#en"],
  "myth": ["calliope", "kiara", "ina'nis", "gura", "amelia", "myth", "en gen 1"],
  "promise": ["fauna", "kronii", "mumei", "baelz", "irys", "promise"],
  "justice": ["elizabeth", "gigi", "cecilia", "raora", "justice"],

  "regloss": ["ao", "kanade", "ririka", "raden", "hajime", "regloss"],
  "flow glow": ["riona", "niko", "su", "mizumiya", "chihaya", "vivi", "flow glow"],

  "holotori": ["kiara", "mumei", "lui", "subaru", "reine", "holotori"],
  "micomet": ["miko", "suisei", "micomet"],
  "soraz": ["sora", "azki", "soraz"],
  "miocomet": ["mio", "miko", "suisei", "miocomet"],
  "shiraken": ["flare", "polka", "suisei", "miko", "noel", "shiraken", "shiranui kensetsu"],

  // ── INDIVIDUAL MASCOTS & FANDOMS ──
  "sora": ["tokino sora", "sora", "ankimo", "nun-nun", "sora-tomo"],
  "robocosan": ["robocosan", "roboco", "roboser"],
  "miko": ["sakura miko", "miko", "35p", "micomet", "mikodanye"],
  "suisei": ["hoshimachi suisei", "suisei", "micomet", "hoshiyomi"],
  "azki": ["azki", "pioneers", "soraz"],

  "mel": ["yozora mel", "mel", "kapumin"],
  "fubuki": ["shirakami fubuki", "fubuki", "sukon-bu", "mitama", "fubura", "shirakami's"],
  "matsuri": ["natsuiro matsuri", "matsuri", "matsurisu", "ebifrion"],
  "aki": ["aki rosenthal", "aki", "rose-tai"],
  "haato": ["akai haato", "haato", "haachama", "haaton"],

  "aqua": ["minato aqua", "aqua", "akukin", "aqua crew"],
  "shion": ["murasaki shion", "shion", "shiokko"],
  "ayame": ["nakiri ayame", "ayame", "nakirigumi", "poyoyo"],
  "choco": ["yuzuki choco", "choco", "chocons"],
  "subaru": ["oozora subaru", "subaru", "subatomo", "subarudo duck"],

  "mio": ["ookami mio", "mio", "mio-fa", "pigeotaurus", "taurus", "fortune telling", "tarot", "hatotaurus"],
  "okayu": ["nekomata okayu", "okayu", "onigiriya", "temari"],
  "korone": ["inugami korone", "korone", "koronesuki", "hosoinu"],

  "pekora": ["usada pekora", "pekora", "nousagi", "don-chan", "carrot"],
  "flare": ["shiranui flare", "flare", "elfriend", "pero"],
  "noel": ["shirogane noel", "noel", "shirogane order", "gyudon"],
  "marine": ["houshou marine", "marine", "houshou pirate", "dokuro-kun"],

  "kanata": ["amane kanata", "kanata", "heimin", "gorilla"],
  "watame": ["tsunomaki watame", "watame", "watamates", "watame's hammer"],
  "towa": ["tokoyami towa", "towa", "kenzoku", "bbibi"],
  "luna": ["himemori luna", "luna", "luknight"],

  "lamy": ["yukihana lamy", "lamy", "yukimin", "daifuku", "maguchi", "lamy's"],
  "nene": ["momosuzu nene", "nene", "nekko", "beetle"],
  "botan": ["shishiro botan", "botan", "ssrb", "upao"],
  "polka": ["omaru polka", "polka", "za-in"],

  "la+": ["laplus darknesss", "la+", "laplus", "plusmate", "karasu"],
  "lui": ["takane lui", "lui", "lui-tomo", "kotori"],
  "koyori": ["hakui koyori", "koyori", "kokoro", "koyori's assistant", "joshu-kun", "koyo"],
  "chloe": ["sakamata chloe", "chloe", "shiikui", "baku", "chloe's"],
  "iroha": ["kazama iroha", "iroha", "kazama-tai", "pokobe"],

  "risu": ["ayunda risu", "risu", "risuners", "riscot"],
  "moona": ["moona hoshinova", "moona", "moonafic"],
  "iofi": ["airani iofifteen", "iofi", "ioforia", "cilus"],

  "ollie": ["kureiji ollie", "ollie", "zomrades", "udin"],
  "anya": ["anya melfissa", "anya", "melfriends"],
  "reine": ["pavolia reine", "reine", "merakyat", "otomo"],

  "zeta": ["vestia zeta", "zeta", "zecretary", "bazo"],
  "kaela": ["kaela kovalskia", "kaela", "pemaloe", "kaela's"],
  "kobo": ["kobo kanaeru", "kobo", "kobokerz", "bobo", "tatang"],

  "calliope": ["mori calliope", "calliope", "deadbeats", "death-sensei"],
  "kiara": ["takanashi kiara", "kiara", "kfp"],
  "ina'nis": ["ninomae ina'nis", "ina'nis", "takodachi"],
  "gura": ["gawr gura", "gura", "chumbuds", "bloop"],
  "amelia": ["watson amelia", "amelia", "teamates", "bubba"],

  "irys": ["irys", "irystocrat", "guyrys"],
  "fauna": ["ceres fauna", "fauna", "saplings", "nemu"],
  "kronii": ["ouro kronii", "kronii", "kronies", "boros"],
  "mumei": ["nanashi mumei", "mumei", "hoomans", "friend"],
  "baelz": ["hakos baelz", "baelz", "bratz", "mr. squeaks"],

  "shiori": ["shiori novella", "shiori", "novellite", "bookmark"],
  "bijou": ["koseki bijou", "bijou", "pebbles", "ruse"],
  "nerissa": ["nerissa ravencroft", "nerissa", "jailbird"],
  "fuwawa": ["fuwawa abyssgard", "fuwawa", "ruffians", "pero", "fuwamoco"],
  "mococo": ["mococo abyssgard", "mococo", "ruffians", "pero", "fuwamoco"],

  "elizabeth": ["elizabeth rose bloodflame", "elizabeth", "rose knights"],
  "gigi": ["gigi murin", "gigi", "chattino"],
  "cecilia": ["cecilia immergreen", "cecilia", "otomatons", "cilius"],
  "raora": ["raora panthera", "raora", "ragazzini", "thorn"],

  "ao": ["hiodoshi ao", "ao"],
  "kanade": ["otonose kanade", "kanade"],
  "ririka": ["ichijou ririka", "ririka"],
  "raden": ["juufuutei raden", "raden"],
  "hajime": ["todoroki hajime", "hajime"],

  "riona": ["isaki riona", "riona"],
  "niko": ["koganei niko", "niko"],
  "su": ["mizumiya su", "su", "mizumiya"],
  "chihaya": ["rindo chihaya", "chihaya"],
  "vivi": ["kikirara vivi", "vivi"]
};

/**
 * Get synergy terms for a search query word
 * @param {string} query - The search query word
 * @returns {Array<string>} Array of matching terms from synergy dictionary
 */
export function getSynergyTerms(query) {
  const lowerQuery = query.toLowerCase().trim();

  // 1. Check exact Nicknames
  const nicknameMap = {
    ina: ["ina'nis", "ina's"],
    calli: ["calliope", "calli's"],
    bae: ["baelz", "bae's"],
    sui: ["suisei"],
    laplus: ["la+"],
    ame: ["amelia", "ame's"],
    roboco: ["robocosan"],
    kiwawa: ["kiara"],
    mei: ["mumei"],
    fwmc: ["fuwawa", "mococo", "fuwamoco"]
  };

  if (nicknameMap[lowerQuery]) {
    return nicknameMap[lowerQuery];
  }

  // 2. Check exact matches in Synergy Dictionary
  if (synergyDictionary[lowerQuery]) {
    return synergyDictionary[lowerQuery];
  }

  // 3. If no exact match is found, just return the word itself normally!
  return [lowerQuery];
}

// List of strict holomem names used for isolation logic
export const strictHolomemNames = [
  "sora", "robocosan", "miko", "suisei", "azki",
  "mel", "fubuki", "matsuri", "aki", "haato", "haachama",
  "aqua", "shion", "ayame", "choco", "subaru",
  "mio", "okayu", "korone",
  "pekora", "flare", "noel", "marine",
  "kanata", "watame", "towa", "luna",
  "lamy", "nene", "botan", "polka",
  "la+", "lui", "koyori", "chloe", "iroha",
  "moona", "risu", "iofi",
  "ollie", "anya", "reine",
  "zeta", "kaela", "kobo",
  "calliope", "kiara", "ina'nis", "gura", "amelia",
  "irys", "fauna", "kronii", "mumei", "baelz",
  "shiori", "bijou", "nerissa", "fuwawa", "mococo", "fuwamoco",
  "elizabeth", "gigi", "cecilia", "raora",
  "ao", "kanade", "ririka", "raden", "hajime",
  "riona", "niko", "su", "chihaya", "vivi","Kyoko","Mela","Sophia","Tsuzuri"
];

// List of strict types
export const strictTypes = [
  "oshi",
  "holomem",
  "support",
  "cheer",
  "tool",
  "event",
  "mascot",
  "fan",
  "staff",
  "item",
  "limited",
  "debut",
  "1st",
  "2nd",
  "spot",
];