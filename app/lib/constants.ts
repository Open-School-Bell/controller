export const VERSION = '2.0.0'

export const RequiredVersions = {
  controller: VERSION,
  tts: '2.0.2',
  piper: '1.6.0',
  sounder: '2.4.0',
  button: '1.0.0',
  controlPoint: '1.0.0'
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
