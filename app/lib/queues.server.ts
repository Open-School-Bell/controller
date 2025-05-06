import {Queue} from 'bullmq'

import {getRedis} from './redis.server.mjs'

const jobsQueue = new Queue('osbc', {connection: getRedis()})

export type Jobs = {
  updateConfig: {ip: string; key: string}
  broadcast: {
    ip: string
    key: string
    fileName: string
    ringerWire: string
    times: number
  }
  lockdown: {ip: string; key: string}
  outboundWebhook: {target: string; key: string}
}

export type JobName = keyof Jobs

export const addJob = <JobName extends keyof Jobs>(
  jobName: JobName,
  jobDetails: Jobs[JobName]
) => {
  return jobsQueue.add(jobName, jobDetails, {removeOnComplete: 20})
}
