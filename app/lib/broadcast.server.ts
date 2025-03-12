import {asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma.server'

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
    await fetch(`http://${sounder.ip}:3000/play`, {
      body: JSON.stringify({
        key: sounder.key,
        sound: audio.fileName,
        ringerWire: audio.ringerWire,
        times
      }),
      headers: {'Content-Type': 'application/json'},
      method: 'post'
    }).catch(() => {})
  })
}
