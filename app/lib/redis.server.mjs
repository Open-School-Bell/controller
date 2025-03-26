import IORedis from 'ioredis'

const connection =
  global.__redis ??
  (global.__redis = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
  }))

/**
 * Get the redis connection
 *
 * @returns {IORedis}
 */
export const getRedis = () => {
  return connection
}
