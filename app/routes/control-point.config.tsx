import {type LoaderFunctionArgs} from '@remix-run/node'

import {getSettings} from '~/lib/settings.server'
import {getPrisma} from '~/lib/prisma.server'
import {getRedis} from '~/lib/redis.server.mjs'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {controlPointKey, controlPointDefaultZone} = await getSettings([
    'controlPointKey',
    'controlPointDefaultZone'
  ])

  const redis = getRedis()

  if (controlPointKey === '') {
    return Response.json({
      result: 'error',
      error: 'Control Point Key has not been set in the settings.'
    })
  }

  const authHeader = request.headers.get('Auth')
  const versionHeader = request.headers.get('Version')

  if (!authHeader) {
    return Response.json({result: 'error', error: 'No key provided.'})
  }

  if (authHeader !== controlPointKey) {
    return Response.json({result: 'error', error: 'Invalid Key provided.'})
  }

  if (versionHeader) {
    void redis.set(`osb-control-point-version`, versionHeader)
  }

  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return Response.json({
    zones: zones.map(({id, name}) => {
      return {id, name}
    }),
    defaultZone:
      controlPointDefaultZone !== '' ? controlPointDefaultZone : zones[0].id
  })
}
