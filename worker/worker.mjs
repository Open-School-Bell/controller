import {Worker, Queue} from 'bullmq'
import cron from 'node-cron'
import {PrismaClient} from '@prisma/client'

import {getRedis} from '../app/lib/redis.server.mjs'

const connection = getRedis()

const prisma = global.__prisma ?? (global.__prisma = new PrismaClient())

const queue = new Queue('osbc', {connection})
const worker = new Worker(
  'osbc',
  async ({name, data}) => {
    if (handlers[name]) {
      handlers[name]({...data})
    } else {
      console.error('No handler')
    }
  },
  {connection}
)

const handlers = {}

/**
 * Creates a typed handle using the types from the queues file in the remix app.
 *
 * @template {import('../app/lib/queues.server').JobName} JobName
 * @param {JobName} job
 * @param {import('bullmq').Processor<import('../app/lib/queues.server').Jobs[JobName]>} processor
 * @returns
 */
const createHandler = (job, processor) => {
  handlers[job] = processor
}

createHandler('updateConfig', async ({ip, key}) => {
  console.log(`Update Sounder ${ip}`)
  await fetch(`http://${ip}:3000/update`, {
    body: JSON.stringify({
      key: key
    }),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {})
})

createHandler('broadcast', async ({ip, key, sounds}) => {
  console.log(`Broadcasting to ${ip}`)
  await fetch(`http://${ip}:3000/play`, {
    body: JSON.stringify({
      key: key,
      sounds
    }),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {
    console.log(`Failed to broadcast to ${ip}`)
  })
})

createHandler('lockdown', async ({ip, key}) => {
  console.log(`Lockingdown ${ip}`)
  await fetch(`http://${ip}:3000/lockdown`, {
    body: JSON.stringify({key}),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {})
})

createHandler('outboundWebhook', async ({target, key}) => {
  console.log(`Sending Webhook call to ${target}`)
  await fetch(target, {
    body: JSON.stringify({key}),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  })
})

createHandler('statusCheck', async () => {
  console.log(`Running status check`)

  await prisma.setting.upsert({
    where: {key: 'workerLastSeen'},
    create: {key: 'workerLastSeen', value: JSON.stringify(new Date())},
    update: {value: JSON.stringify(new Date())}
  })

  fetch(`${process.env.TTS_API}/status.json`)
    .then(async () => {
      await prisma.setting.upsert({
        where: {key: 'ttsLastSeen'},
        create: {key: 'ttsLastSeen', value: JSON.stringify(new Date())},
        update: {value: JSON.stringify(new Date())}
      })
    })
    .catch(() => {
      console.log('Unable to contact tts')
    })
})

cron.schedule('* * * * *', () => {
  queue.add('statusCheck')
})

console.log('Ready to accept jobs')
