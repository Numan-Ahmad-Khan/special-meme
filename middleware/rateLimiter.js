const redis = require("../config/redis");

const rateLimiter = (keyPrefix, limit, windowSeconds) => {
    return async (req, res, next) => {
        try {
            const key = `${keyPrefix}:${req.user.userId}`;

            const currentCount = await redis.incr(key);

            if (currentCount === 1) {
                await redis.expire(key, windowSeconds);
            }

            if (currentCount > limit) {
                return res.status(429).json({
                    message: "Too many requests. Please try again later."
                });
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error);
            next();
        }
    };
};

module.exports = rateLimiter;