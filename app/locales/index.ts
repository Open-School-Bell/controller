import {en} from './en'
import {pl} from './pl'

export const locales = {
  en,
  pl
}

export const FALLBACK_LOCALE = 'en' as const

export type SupportedLocale = keyof typeof locales
export type MessageKey = keyof (typeof locales)[typeof FALLBACK_LOCALE]
