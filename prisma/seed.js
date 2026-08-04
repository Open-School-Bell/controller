/**
 * Seed.JS is used to update the controllers database with any data movement that can't be in a Migration.
 *
 * This file is run every time the controller starts, so anything in here must check if it needs to act before acting.
 *
 * This file should be able to take any database from its major version and migrate it to the latest. It can then
 * be reset when the major version increases as you know for sure that you are coming from the latest version of the
 * previous major version.
 *
 */

import fs from 'fs'
import path from 'path'

import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3'
import {PrismaClient} from './generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaBetterSqlite3({url: connectionString})

const prisma = new PrismaClient({adapter})
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
  }
}

main()
