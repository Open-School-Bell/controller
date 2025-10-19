import type {LoaderFunctionArgs} from '@remix-run/node'

import {locales, type SupportedLocale} from '~/locales'
import type {Messages} from './i18n.shared'

const FALLBACK_LOCALE: SupportedLocale = 'en'

const resolveLocale = (request: LoaderFunctionArgs['request']): SupportedLocale => {
  const acceptLanguage = request.headers.get('accept-language')

  if (acceptLanguage) {
    const requestedLocales = acceptLanguage
      .split(',')
      .map(part => part.split(';')[0]?.trim())
      .filter(Boolean) as string[]

    for (const requested of requestedLocales) {
      const normalized = requested.toLowerCase()

      const exactMatch = Object.keys(locales).find(locale => locale === normalized)
      if (exactMatch) {
        return exactMatch as SupportedLocale
      }

      const prefixMatch = Object.keys(locales).find(locale =>
        normalized.startsWith(`${locale.toLowerCase()}-`)
      )

      if (prefixMatch) {
        return prefixMatch as SupportedLocale
      }
    }
  }

  return FALLBACK_LOCALE
}

const getMessages = (locale: SupportedLocale): Messages => {
  return locales[locale]
}

export const initTranslations = (request: LoaderFunctionArgs['request']) => {
  const locale = resolveLocale(request)
  const messages = getMessages(locale)

  return {locale, messages}
}

export type InitTranslationsReturn = ReturnType<typeof initTranslations>
