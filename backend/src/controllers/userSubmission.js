const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const DailyProblem = require("../models/DailyProblem");
// Ensure this path matches exactly where you put the fixed utility file
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try {
        // SAFETY 1: Check if middleware populated user
        if (!req.result || !req.result._id) {
            return res.status(401).send("Unauthorized: User not found in request");
        }

        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!code || !problemId || !language)
            return res.status(400).send("Missing code, problemId, or language");

        if (language === 'cpp') language = 'c++';

        // 1. Fetch problem
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");

        // 2. Create Initial Submission Record (Pending)
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });

        // 3. Prepare Batch for Judge0
        const languageId = getLanguageById(language);
        
        // SAFETY 2: Ensure test cases exist
        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            return res.status(500).send("Problem has no hidden test cases configured");
        }

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        // Call Utility
        const submitResult = await submitBatch(submissions);
        
        // SAFETY 3: Check if Judge0 returned valid tokens
        if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Invalid response from Judge0 submitBatch");
        }

        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        // 4. Process Results
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id === 3) {
                // 3 = Accepted
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                // Handle Failures
                if (test.status_id === 4) {
                    status = 'wrong';
                    errorMessage = test.stderr || "Output mismatch";
                } else if (test.status_id === 6) {
                    status = 'error';
                    errorMessage = test.compile_output || "Compilation Error";
                } else if (test.status_id === 5) {
                    status = 'error';
                    errorMessage = "Time Limit Exceeded";
                } else {
                    status = 'error';
                    errorMessage = test.stderr || test.message || "Runtime Error";
                }
            }
        }

        // 5. Update Submission Record
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        // 6. Update User Profile (SAFE METHOD)
        const accepted = (status === 'accepted');

        if (accepted) {
            // Fetch User explicitly to guarantee .save() works and avoid middleware crashes
            const user = await User.findById(userId);
            
            if (user) {
                // A. Add to Problem Solved (Avoid Duplicates safely)
                // Convert both to strings for comparison to be safe
                const alreadySolved = user.problemSolved.some(
                    pid => pid.toString() === problemId.toString()
                );

                if (!alreadySolved) {
                    user.problemSolved.push(problemId);
                    await user.save();
                }

                // B. Update Streak
                await updateStreak(userId, problemId);
            }
        }

        // 7. Send Response
        res.status(201).json({
            accepted,
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory,
            status,
            errorMessage
        });

    } catch (err) {
        console.error("Submit Code Error:", err.message);
        // Ensure we don't send a response if one was already sent
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error: " + err.message);
        }
    }
}

const runCode = async (req, res) => {
    try {
        if (!req.result || !req.result._id) {
            return res.status(401).send("Unauthorized");
        }
        
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!code || !problemId || !language)
            return res.status(400).send("Missing code, problemId, or language");

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");

        if (language === 'cpp') language = 'c++';
        const languageId = getLanguageById(language);

        // Run against VISIBLE test cases
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        let runtime = 0;
        let memory = 0;
        let overallSuccess = true;

        for (const test of testResult) {
            if (test.status_id === 3) {
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                overallSuccess = false;
            }
        }

        res.status(200).json({
            success: overallSuccess,
            testCases: testResult,
            runtime,
            memory
        });

    } catch (err) {
        console.error("Run Code Error:", err.message);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error: " + err.message);
        }
    }
}

// STREAK LOGIC (Kept exactly as logic dictates, just safety wrapped)
const updateStreak = async (userId, problemId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Get Today's POTD
        const potd = await DailyProblem.findOne({ date: today });
        
        // Check if POTD exists and matches the problem just solved
        if (!potd || potd.problemId.toString() !== problemId.toString()) return;

        const user = await User.findById(userId);
        if (!user) return;

        // Initialize streak if missing
        if (!user.streak) {
            user.streak = { current: 0, longest: 0, lastSolvedDate: null };
            user.solvedPOTDDates = [];
        }

        // 2. Prevent Double Counting
        if (user.streak.lastSolvedDate === today) return;

        // 3. Calculate Yesterday
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        // 4. Update Streak
        if (user.streak.lastSolvedDate === yesterday) {
            user.streak.current += 1;
        } else {
            user.streak.current = 1;
        }

        // 5. Update Longest
        if (user.streak.current > user.streak.longest) {
            user.streak.longest = user.streak.current;
        }

        // 6. Save Data
        user.streak.lastSolvedDate = today;
        user.solvedPOTDDates.push(today);
        
        await user.save();
        console.log(`Streak updated for user ${userId}`);
    } catch (err) {
        // Just log streak errors, don't crash the request
        console.error("Streak update error:", err.message);
    }
};

module.exports = { submitCode, runCode, updateStreak };