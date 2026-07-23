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

  const schedulesWithNoSequence = await prisma.schedule.findMany({
    where: {audioSequence: ''}
  })

  if (schedulesWithNoSequence.length > 0) {
    console.log('Schedules need migrating to the audio sequence system.')

    const promises = schedulesWithNoSequence.map(({id, audioId, count}) => {
      return new Promise(async resolve => {
        const sequence = []

        let i = 0
        while (i < count) {
          sequence.push(audioId)
          i++
        }

        await prisma.schedule.update({
          where: {id},
          data: {audioSequence: JSON.stringify(sequence)}
        })

        resolve()
      })
    })

    await Promise.all(promises)
  }

  const actionsWithAudioIdAndNoData = await prisma.action.findMany({
    where: {audioId: {not: ''}, data: ''}
  })

  await Promise.all(
    actionsWithAudioIdAndNoData.map(action => {
      return prisma.action.update({
        where: {id: action.id},
        data: {data: `["${action.audioId}"]`}
      })
    })
  )

  const lockdownSettings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'lockdownEntrySound',
          'lockdownExitSound',
          'lockdownExitRepeat',
          'lockdownRepetitions'
        ]
      }
    }
  })

  if (lockdownSettings.length > 0) {
    const lockdownEntrySound = lockdownSettings.reduce((v, {key, value}) => {
      if (v) return v
      if (key === 'lockdownEntrySound') return value
      return undefined
    }, undefined)

    const lockdownRepetitions = lockdownSettings.reduce((v, {key, value}) => {
      if (v) return v
      if (key === 'lockdownRepetitions') return value
      return undefined
    }, undefined)

    if (lockdownEntrySound && lockdownRepetitions) {
      const entrySequence = []

      let i = 0
      while (i < parseInt(lockdownRepetitions)) {
        entrySequence.push(lockdownEntrySound)
        i++
      }

      await prisma.setting.upsert({
        where: {key: 'lockdownEntrySequence'},
        create: {
          key: 'lockdownEntrySequence',
          value: JSON.stringify(entrySequence)
        },
        update: {value: JSON.stringify(entrySequence)}
      })

      await prisma.setting.deleteMany({
        where: {key: {in: ['lockdownEntrySound', 'lockdownRepetitions']}}
      })
    }

    const lockdownExitSound = lockdownSettings.reduce((v, {key, value}) => {
      if (v) return v
      if (key === 'lockdownExitSound') return value
      return undefined
    }, undefined)

    const lockdownExitRepeat = lockdownSettings.reduce((v, {key, value}) => {
      if (v) return v
      if (key === 'lockdownExitRepeat') return value
      return undefined
    }, undefined)

    if (lockdownExitSound && lockdownExitRepeat) {
      const exitSequence = []

      let i = 0
      while (i < parseInt(lockdownExitRepeat)) {
        exitSequence.push(lockdownExitSound)
        i++
      }

      await prisma.setting.upsert({
        where: {key: 'lockdownExitSequence'},
        create: {
          key: 'lockdownExitSequence',
          value: JSON.stringify(exitSequence)
        },
        update: {value: JSON.stringify(exitSequence)}
      })

      await prisma.setting.deleteMany({
        where: {key: {in: ['lockdownExitSound', 'lockdownExitRepeat']}}
      })
    }
  }
}

main()
