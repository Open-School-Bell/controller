import {type LoaderFunctionArgs} from '@remix-run/node'

import {
  locales,
  type SupportedLocale,
  FALLBACK_LOCALE,
  MessageKey
} from '~/locales'
import {type Messages} from './i18n.shared'

const resolveLocale = (
  request: LoaderFunctionArgs['request']
): SupportedLocale => {
  const acceptLanguage = request.headers.get('accept-language')

  if (acceptLanguage) {
    const requestedLocales = acceptLanguage
      .split(',')
      .map(part => part.split(';')[0]?.trim())
      .filter(Boolean) as string[]

    for (const requested of requestedLocales) {
      const normalized = requested.toLowerCase()

      const exactMatch = Object.keys(locales).find(
        locale => locale === normalized
      )
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
  const messages: Messages = {}

  ;(Object.keys(locales[FALLBACK_LOCALE]) as MessageKey[]).forEach(key => {
    messages[key] =
      (locales[locale] as Partial<(typeof locales)[typeof FALLBACK_LOCALE]>)[
        key
      ] ?? locales[FALLBACK_LOCALE][key]
  })

  return messages
}

export const initTranslations = (request: LoaderFunctionArgs['request']) => {
  const locale = resolveLocale(request)
  const messages = getMessages(locale)

  return {locale, messages}
}

export type InitTranslationsReturn = ReturnType<typeof initTranslations>
