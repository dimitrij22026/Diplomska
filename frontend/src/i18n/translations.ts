import mk from './mk.json';
import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';

export const translations = {
  mk,
  en,
  de,
  fr,
  es,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

