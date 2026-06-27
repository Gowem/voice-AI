// Real Anam AI personas created in your account.
// Persona IDs are live and ready to use.

export const PERSONAS = [
  // ── English (US) ──────────────────────────────────────────────────────────
  {
    id: 'f348bd25-d547-40e4-9ce6-b6e08c54c191',
    name: 'Leo',
    gender: 'Male',
    language: 'en',
    langName: 'English',
    accent: 'American',
    emoji: '👨‍💼',
    recognitionLang: 'en-US',
    description: 'Friendly & warm American male',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: '241c13f0-87f9-4023-817a-67ff4db124ed',
    name: 'Corey',
    gender: 'Male',
    language: 'en',
    langName: 'English',
    accent: 'American',
    emoji: '🧑‍💻',
    recognitionLang: 'en-US',
    description: 'Cheerful & supportive American male',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'ebf99885-c22b-4382-9a9d-533f3e9ce819',
    name: 'Rachel',
    gender: 'Female',
    language: 'en',
    langName: 'English',
    accent: 'American',
    emoji: '👩‍💼',
    recognitionLang: 'en-US',
    description: 'Polished & professional American female',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'ee72775c-f1be-4f36-84ed-11a7743da33a',
    name: 'Amanda',
    gender: 'Female',
    language: 'en',
    langName: 'English',
    accent: 'American',
    emoji: '👩‍🎓',
    recognitionLang: 'en-US',
    description: 'Warm & approachable American female',
    gradient: 'from-rose-500 to-pink-600',
  },
  // ── English (GB) ──────────────────────────────────────────────────────────
  {
    id: 'c42fd72e-f8d5-4ff2-81de-84624d84da52',
    name: 'Archie',
    gender: 'Male',
    language: 'en',
    langName: 'English',
    accent: 'British',
    emoji: '🧑‍🏫',
    recognitionLang: 'en-GB',
    description: 'Warm & conversational British male',
    gradient: 'from-indigo-600 to-violet-700',
  },
  {
    id: '6f2e870c-40d9-4491-86db-ff0310a21ec8',
    name: 'Lucy',
    gender: 'Female',
    language: 'en',
    langName: 'English',
    accent: 'British',
    emoji: '👩‍💻',
    recognitionLang: 'en-GB',
    description: 'Fresh & energetic British female',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
];

// franc ISO 639-3 → ISO 639-1 language code
export const FRANC_TO_LANG = {
  eng: 'en',
  hin: 'hi',
  tam: 'ta',
  tel: 'te',
  mar: 'mr',
  ben: 'bn',
  kan: 'kn',
  mal: 'ml',
  guj: 'gu',
  pan: 'pa',
  spa: 'es',
  fra: 'fr',
  deu: 'de',
  ara: 'ar',
  por: 'pt',
  zho: 'zh',
  jpn: 'ja',
  kor: 'ko',
  rus: 'ru',
  urd: 'ur',
  nep: 'ne',
  sin: 'si',
};

// ISO 639-1 → BCP-47 recognition language
export const LANG_TO_RECOGNITION = {
  en: 'en-US',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ar: 'ar-SA',
  pt: 'pt-BR',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ru: 'ru-RU',
  ur: 'ur-PK',
};

// All recognition languages for the selector panel
export const RECOGNITION_LANGS = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'ar-SA', label: 'Arabic' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'pt-BR', label: 'Portuguese (BR)' },
  { code: 'ru-RU', label: 'Russian' },
  { code: 'ko-KR', label: 'Korean' },
];

export function getPersonasByLanguage(langCode, list = PERSONAS) {
  return list.filter((p) => p.language === langCode);
}

/** Extract ISO 639-1 from a BCP-47 code ('hi-IN' → 'hi') */
export function detectLangCode(recognitionLang) {
  return recognitionLang ? recognitionLang.split('-')[0] : 'en';
}

export const DEFAULT_PERSONA = PERSONAS[0];
