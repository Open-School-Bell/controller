import {type LoaderFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {VERSION} from '~/lib/constants'
import {getSettings} from '~/lib/settings.server'

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const {lockdownMode} = await getSettings(['lockdownMode'])

  const sounders = await prisma.sounder.findMany({
    select: {id: true, name: true, lastCheckIn: true, enrolled: true, ip: true}
  })
  const zones = await prisma.zone.findMany()

  const soundersObject: {[sounderId: string]: ArrayElement<typeof sounders>} =
    {}
  sounders.forEach(sounder => {
    soundersObject[sounder.id] = sounder
  })

  return Response.json({
    lockdown: lockdownMode === '1',
    sounders: soundersObject,
    version: VERSION,
    zones
  })
}
