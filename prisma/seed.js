// Seed.js is run every time the container starts,
// any code here needs to make sure that it checks
// to see if the data needs to be added before adding it.

import fs from 'fs'
import path from 'path'

import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()
const {copyFile} = fs.promises

const main = async () => {
  const soundCount = await prisma.audio.count()

  if (soundCount === 0) {
    console.log('No audio')
    const sound = await prisma.audio.create({
      data: {
        name: 'Bell',
        ringerWire: '',
        fileName: ''
      }
    })

    await copyFile(
      path.join(process.cwd(), 'support', 'bell.mp3'),
      path.join(process.cwd(), 'public', 'sounds', `${sound.id}.mp3`)
    )

    await prisma.audio.update({
      where: {id: sound.id},
      data: {fileName: `${sound.id}.mp3`}
    })

    await prisma.setting.upsert({
      where: {key: 'lockdownEntrySound'},
      create: {key: 'lockdownEntrySound', value: sound.id},
      update: {value: sound.id}
    })

    await prisma.setting.upsert({
      where: {key: 'lockdownExitSound'},
      create: {key: 'lockdownExitSound', value: sound.id},
      update: {value: sound.id}
    })
  }
}

main()
