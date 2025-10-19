import type {Messages} from './i18n.shared'

type MatchWithData = {
  id: string
  data?: unknown
}

const ROOT_ID = 'root'

type RootData = {
  locale: string
  messages: Messages
}

export const getRootI18n = (matches: MatchWithData[]): RootData => {
  const rootMatch = matches.find(match => match.id === ROOT_ID)

  if (
    rootMatch &&
    typeof rootMatch.data === 'object' &&
    rootMatch.data !== null
  ) {
    const {locale, messages} = rootMatch.data as RootData
    return {locale, messages}
  }

  return {locale: 'en', messages: {}}
}
