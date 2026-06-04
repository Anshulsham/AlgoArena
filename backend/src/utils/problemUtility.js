const axios = require('axios');

// 1. Validate API Key Check (Logs error if missing)
const API_KEY = process.env.RAPID_API_KEY || process.env.JUDGE0_KEY;
if (!API_KEY) {
    console.error("FATAL ERROR: RAPID_API_KEY is missing in .env file");
}

// 2. Helper: Encode String to Base64 (Crucial for Judge0)
const encode = (str) => {
    return Buffer.from(str || '').toString('base64');
};

// 3. Helper: Decode Base64 to String (Crucial for reading results)
const decode = (str) => {
    if (!str) return null;
    return Buffer.from(str, 'base64').toString('utf-8');
};

const getLanguageById = (lang) => {
    switch (lang?.toLowerCase()) {
        case 'c++':
        case 'cpp': return 54;
        case 'java': return 62;
        case 'javascript': return 63;
        default: return 54;
    }
};

const submitBatch = async (submissions) => {
    // --- FIX START ---
    // We MUST encode source_code, input, and output because we set base64_encoded=true
    const encodedSubmissions = submissions.map(sub => ({
        ...sub,
        source_code: encode(sub.source_code),
        stdin: encode(sub.stdin),
        expected_output: encode(sub.expected_output)
    }));
    // --- FIX END ---

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: { base64_encoded: 'true' }, // Tells Judge0 to expect Base64
        headers: {
            'content-type': 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
            submissions: encodedSubmissions // Send the ENCODED data
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Judge0 Submit Error:", error.response?.data?.message || error.message);
        throw error;
    }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const JUDGE0_POLL_INTERVAL_MS = 2000;
const JUDGE0_MAX_POLL_ATTEMPTS = 15;

const submitToken = async (tokens) => {
    const tokenString = tokens.join(',');
    
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: tokenString,
            base64_encoded: 'true', // Receive results in Base64 (safer)
            fields: '*'
        },
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
    };

    // Polling Logic
    for (let attempt = 1; attempt <= JUDGE0_MAX_POLL_ATTEMPTS; attempt++) {
        try {
            const response = await axios.request(options);
            const submissions = response.data.submissions;

            // Check if processed (Status ID > 2 means Accepted, Error, Wrong, etc.)
            const isFinished = submissions.every(sub => sub.status_id > 2);

            if (isFinished) {
                // Decode results back to text
                return submissions.map(sub => ({
                    ...sub,
                    stdout: decode(sub.stdout),
                    stderr: decode(sub.stderr),
                    compile_output: decode(sub.compile_output),
                    message: decode(sub.message)
                }));
            }

            // Wait 2 seconds
            if (attempt < JUDGE0_MAX_POLL_ATTEMPTS) {
                await waiting(JUDGE0_POLL_INTERVAL_MS);
            }

        } catch (error) {
            console.error("Judge0 Polling Error:", error.response?.data?.message || error.message);
            throw error;
        }
    }

    throw new Error("Judge0 polling timed out");
};

module.exports = { getLanguageById, submitBatch, submitToken };
