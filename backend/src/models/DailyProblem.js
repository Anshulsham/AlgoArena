const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyProblemSchema = new Schema({
    date: { 
        type: String, 
        required: true, 
        unique: true // Ensure only one problem per date (e.g., "2025-12-17")
    }, 
    problemId: { 
        type: Schema.Types.ObjectId, 
        ref: 'problem', 
        required: true 
    }
});

const DailyProblem = mongoose.model('dailyProblem', dailyProblemSchema);
module.exports = DailyProblem;