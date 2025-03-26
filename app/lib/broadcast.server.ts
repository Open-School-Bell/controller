import {asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma.server'
import {addJob} from './queues.server'

export const broadcast = async (
  zone: string,
  sound: string,
  times: number = 1
) => {
  const prisma = getPrisma()

  const z = await prisma.zone.findFirstOrThrow({
    where: {id: zone},
    include: {sounders: {include: {sounder: true}}}
  })

  const audio = await prisma.audio.findFirstOrThrow({where: {id: sound}})

  return asyncForEach(z.sounders, async ({sounder}) => {
    await addJob('broadcast', {
      ip: sounder.ip,
      key: sounder.key,
      fileName: audio.fileName,
      ringerWire: audio.ringerWire,
      times
    })
  })
}
