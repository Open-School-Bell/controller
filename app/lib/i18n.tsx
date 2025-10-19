import {createContext, useContext} from 'react'

import type {Messages, TranslateReplacements} from './i18n.shared'
import {translate as baseTranslate} from './i18n.shared'

type I18nContextValue = {
  locale: string
  messages: Messages
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  messages: {}
})

export const I18nProvider: React.FC<{
  locale: string
  messages: Messages
  children: React.ReactNode
}> = ({locale, messages, children}) => {
  return (
    <I18nContext.Provider value={{locale, messages}}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(I18nContext)

  const t = (key: string, replacements: TranslateReplacements = {}) => {
    return baseTranslate(context.messages, key, replacements)
  }

  return {t, locale: context.locale}
}

export const translate = baseTranslate
