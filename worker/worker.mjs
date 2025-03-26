import {Worker, Queue} from 'bullmq'

import {getRedis} from '../app/lib/redis.server.mjs'

const connection = getRedis()

const queue = new Queue('osbc', {connection})
const worker = new Worker(
  'osbc',
  async ({name, data}) => {
    console.dir(data)
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

createHandler('broadcast', async ({ip, key, times, fileName, ringerWire}) => {
  console.log(`Broadcasting to ${ip}`)
  await fetch(`http://${ip}:3000/play`, {
    body: JSON.stringify({
      key: key,
      sound: fileName,
      ringerWire: ringerWire,
      times
    }),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {})
})

createHandler('lockdown', async ({ip, key}) => {
  console.log(`Lockingdown ${ip}`)
})

console.log('Ready to accept jobs')
