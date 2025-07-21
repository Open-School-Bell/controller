export const VERSION = '1.2.0'

export const RequiredVersions = {
  controller: VERSION,
  tts: '1.0.1',
  piper: '1.2.0',
  sounder: '1.1.1'
}

export const DOCS_URL = `https://openschoolbell.co.uk`

export const EVENT_TYPES = [
  'action',
  'newAction',
  'deleteAction',
  'ignore',
  'lockdownEnd',
  'lockdownStart',
  'login'
] as const
