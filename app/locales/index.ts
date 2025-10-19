import {en} from './en'
import {pl} from './pl'

export const locales = {
  en,
  pl
}

export type SupportedLocale = keyof typeof locales
