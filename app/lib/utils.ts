import {DOCS_URL} from './constants'

export const makeKey = () => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < 32) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

export const INPUT_CLASSES =
  'p-2 border border-gray-300 rounded-md shadow w-full'

export const pageTitle = (...parts: string[]) => {
  return ['Open School Bell', ...parts].join(' / ')
}

export const docsLink = (path: string) => {
  return `${DOCS_URL}${path}`
}
