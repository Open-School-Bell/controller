export type Messages = Record<string, string>

export type TranslateReplacements = Record<string, string | number>

export const translate = (
  messages: Messages,
  key: string,
  replacements: TranslateReplacements = {}
) => {
  const template = messages[key] ?? key

  return Object.keys(replacements).reduce((acc, replacementKey) => {
    const value = replacements[replacementKey]
    const pattern = new RegExp(`{{\\s*${replacementKey}\\s*}}`, 'g')
    return acc.replace(pattern, String(value))
  }, template)
}
