const redisClient = require('../config/redis'); // Make sure this path points to your redis client file

const rateLimiter = (limit, duration) => {
    return async (req, res, next) => {
        try {
            // Identifier: Use User ID if logged in, otherwise fall back to IP address
            // This prevents logged-in users from bypassing limits by switching IPs
            const identifier = req.result ? req.result._id.toString() : req.ip; 
            const key = `rate_limit:${identifier}:${req.originalUrl}`; // Unique key per user per route

            // Increment the counter for this user/route combo
            const requestCount = await redisClient.incr(key);

            // If this is the *first* request, set the expiration timer (window)
            if (requestCount === 1) {
                await redisClient.expire(key, duration);
            }

            // Check if they exceeded the limit
            if (requestCount > limit) {
                const ttl = await redisClient.ttl(key); // Get time remaining
                return res.status(429).json({
                    error: "Too many requests",
                    message: `Limit reached. Please try again in ${ttl} seconds.`
                });
            }

            // If under the limit, let them pass
            next();

        } catch (error) {
            console.error("Rate Limiter Redis Error:", error);
            // Fail-open: If Redis is down, allow the request so we don't block legitimate users
            next(); 
        }
    };
};

module.exports = rateLimiter;
