export interface ParsedMandiItem {
  crop: string;
  rawQuantity: number;
  unit: string;
  weightKg: number;
  ratePerKg: number;
  totalPkr: number;
  confidence: 'high' | 'medium';
}

const UNIT_TO_KG: Record<string, number> = {
  // Standard & Pakistani Mandi Weights
  kg: 1,
  kilo: 1,
  kilogram: 1,
  ser: 1,
  seer: 1,
  mann: 40,
  man: 40,
  maund: 40,
  dhari: 5,
  dharri: 5,
  pao: 0.25,
  paao: 0.25,
  adh: 0.5,
  aadha: 0.5,
  // Standard wholesale crates/sacks (configurable defaults)
  peti: 18,
  crate: 18,
  bori: 50,
  katta: 50,
  gaddi: 0.2,
};

const MANDI_CROPS: Record<string, string> = {
  // Urdu / Sindhi / Roman-Urdu -> Standardized Bilingual Label
  tamatar: 'Tamatar (Tomato)',
  tomato: 'Tamatar (Tomato)',
  pyaz: 'Pyaz (Onion)',
  basar: 'Basar / Pyaz (Onion)',
  onion: 'Pyaz (Onion)',
  aloo: 'Aloo (Potato)',
  patata: 'Patata / Aloo (Potato)',
  potato: 'Aloo (Potato)',
  mirch: 'Hari Mirch (Green Chili)',
  mirchi: 'Mirchi (Chili)',
  bhindi: 'Bhindi (Okra)',
  bhendi: 'Bhendi (Okra)',
  karela: 'Karela (Bitter Gourd)',
  tinda: 'Tinda (Apple Gourd)',
  kaddu: 'Kaddu (Pumpkin)',
  gobhi: 'Phool Gobhi (Cauliflower)',
  palak: 'Palak (Spinach)',
  dhaniya: 'Hara Dhaniya (Coriander)',
  adrak: 'Adrak (Ginger)',
  lehsan: 'Lehsan (Garlic)',
  thoom: 'Thoom / Lehsan (Garlic)',
  aam: 'Sindhri Aam (Mango)',
  amb: 'Amb / Aam (Mango)',
  khajoor: 'Khairpur Khajoor (Dates)',
  kela: 'Kela (Banana)',
  kewra: 'Kela (Banana)',
};

/**
 * Parses spoken mandi phrases such as:
 * "2 mann tamatar 120 rupay kilo" or "5 dhari basar rate 80"
 */
export function parseMandiSpeech(transcript: string): ParsedMandiItem | null {
  const clean = transcript.toLowerCase().replace(/[,،]/g, ' ').trim();
  const tokens = clean.split(/\s+/);

  // 1. Identify Crop
  let detectedCrop = '';
  for (const token of tokens) {
    if (MANDI_CROPS[token]) {
      detectedCrop = MANDI_CROPS[token];
      break;
    }
  }
  if (!detectedCrop) return null;

  // 2. Extract numbers (first number = quantity, second number = rate per kg)
  const numbers = clean.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  if (numbers.length === 0) return null;

  const rawQuantity = numbers[0];
  const ratePerKg = numbers.length >= 2 ? numbers[1] : 0;

  // 3. Identify Mandi Unit (defaults to kilo if omitted)
  let detectedUnit = 'kilo';
  let multiplier = 1;
  for (const token of tokens) {
    if (UNIT_TO_KG[token] !== undefined) {
      detectedUnit = token;
      multiplier = UNIT_TO_KG[token];
      break;
    }
  }

  const weightKg = Number((rawQuantity * multiplier).toFixed(2));
  const totalPkr = Math.round(weightKg * ratePerKg);

  return {
    crop: detectedCrop,
    rawQuantity,
    unit: detectedUnit,
    weightKg,
    ratePerKg,
    totalPkr,
    confidence: ratePerKg > 0 ? 'high' : 'medium',
  };
}
