import {asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma.server'
import {addJob} from './queues.server'

/**
 *
 * @param zone The ID of the Zone to broadcase to
 * @param sounds An array as a JSON string of IDS to play.
 * @returns
 */
export const broadcast = async (zone: string, sounds: string) => {
  const prisma = getPrisma()

  const z = await prisma.zone.findFirstOrThrow({
    where: {id: zone},
    include: {sounders: {include: {sounder: true}}}
  })

  return asyncForEach(z.sounders, async ({sounder}) => {
    await addJob('broadcast', {
      ip: sounder.ip,
      key: sounder.key,
      sounds
    })
  })
}
