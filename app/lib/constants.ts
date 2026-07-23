export const VERSION = '1.7.0'

export const RequiredVersions = {
  controller: VERSION,
  tts: '2.0.0',
  piper: '1.3.0',
  sounder: '2.4.0',
  button: '1.0.0'
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
