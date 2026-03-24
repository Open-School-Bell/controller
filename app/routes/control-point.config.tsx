import {type LoaderFunctionArgs} from '@remix-run/node'

import {getSetting} from '~/lib/settings.server'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const controlPointKey = await getSetting('controlPointKey')

  if (controlPointKey === '') {
    return {
      result: 'error',
      error: 'Control Point Key has not been set in the settings.'
    }
  }

  const authHeader = request.headers.get('Auth')

  if (!authHeader) {
    return {result: 'error', error: 'No key provided.'}
  }

  if (authHeader !== controlPointKey) {
    return {result: 'error', error: 'Invalid Ket provided.'}
  }

  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return {
    zones: zones.map(({id, name}) => {
      return {id, name}
    })
  }
}
