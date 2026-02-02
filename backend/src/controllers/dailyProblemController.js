const DailyProblem = require("../models/DailyProblem");
const Problem = require("../models/problem");
// 1. Import Redis Client
const redisClient = require('../config/redis');

// Helper to get today's date in YYYY-MM-DD format (avoids timezone issues)
const getTodayString = () => new Date().toISOString().split('T')[0];

const getProblemOfTheDay = async (req, res) => {
    try {
        const today = getTodayString();
        // Use a dynamic key based on date so the cache rotates automatically every day
        const CACHE_KEY = `daily_potd_${today}`;

        // --- REDIS START: Check Cache First ---
        const cachedData = await redisClient.get(CACHE_KEY);

        if (cachedData) {
            console.log('⚡ Using Cached POTD from Redis');
            return res.status(200).json(JSON.parse(cachedData));
        }
        // --- REDIS END ---

        console.log('🐢 Cache Miss - Fetching/Creating in MongoDB');

        // 1. Check if POTD already exists for today
        let daily = await DailyProblem.findOne({ date: today }).populate('problemId');

        // 2. If NOT, create one automatically
        if (!daily) {
            // Count total problems
            const count = await Problem.countDocuments();
            if (count === 0) return res.status(404).send("No problems found in DB");

            // Pick a random index
            const random = Math.floor(Math.random() * count);
            const randomProblem = await Problem.findOne().skip(random);
            
            // Save it as today's problem
            daily = await DailyProblem.create({
                date: today,
                problemId: randomProblem._id
            });
            
            // Populate details to send back to frontend
            daily = await daily.populate('problemId');
        }

        // --- REDIS START: Save to Cache ---
        // Save for 24 hours (86400 seconds)
        await redisClient.set(CACHE_KEY, JSON.stringify(daily), {
            EX: 86400 
        });
        // --- REDIS END ---

        res.status(200).send(daily);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching POTD: " + err.message);
    }
};

const getPreviousPOTDs = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Find problems where date is LESS THAN today
        // Sort by date descending (yesterday first)
        // Limit to 3 items
        const previousProblems = await DailyProblem.find({ date: { $lt: today } })
            .sort({ date: -1 })
            .limit(3)
            .populate({
                path: 'problemId',
                select: 'title difficulty tags' // Only fetch needed fields
            });

        res.status(200).json(previousProblems);
    } catch (err) {
        res.status(500).send("Error fetching previous problems: " + err.message);
    }
};

module.exports = { getProblemOfTheDay, getPreviousPOTDs };