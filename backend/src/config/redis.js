const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-17834.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 17834
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// --- THE FIX: Check if open before connecting ---
(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('✅ Redis Connected to Cloud');
    }
})();

module.exports = redisClient;