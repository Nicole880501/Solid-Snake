const { createClient } = require('redis')
const dotenv = require('dotenv')

dotenv.config()

const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

const connectRedisClients = async () => {
  await Promise.all([pubClient.connect(), subClient.connect()])
}

module.exports = { pubClient, subClient, connectRedisClients }
