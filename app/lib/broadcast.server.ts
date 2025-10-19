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

  let soundQueue: string[]

  try {
    const parsed = JSON.parse(sounds) as unknown
    soundQueue = Array.isArray(parsed) ? parsed : []
  } catch {
    soundQueue = []
  }

  if (soundQueue.length === 0) {
    return
  }

  const audio = await prisma.audio.findMany({
    where: {id: {in: soundQueue}},
    select: {id: true, fileName: true}
  })

  const audioMap = new Map(audio.map(item => [item.id, item]))

  const filteredQueue = soundQueue.filter(id => {
    const audioItem = audioMap.get(id)
    return Boolean(audioItem?.fileName)
  })

  if (filteredQueue.length === 0) {
    return
  }

  return asyncForEach(z.sounders, async ({sounder}) => {
    await addJob('broadcast', {
      ip: sounder.ip,
      key: sounder.key,
      sounds: JSON.stringify(filteredQueue)
    })
  })
}
