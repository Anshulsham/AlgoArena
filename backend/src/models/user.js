const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem',
        }],
    },
    password:{
        type:String,
        required: true
    },
    streak: {
        current: { type: Number, default: 0 },   // Current active streak
        longest: { type: Number, default: 0 },   // Longest streak ever achieved
        lastSolvedDate: { type: String }         // Stores date as "YYYY-MM-DD"
    },
    
    solvedPOTDDates: [{ 
        type: String // Stores history like ["2025-12-01", "2025-12-02"]
    }]
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});


const User = mongoose.model("user",userSchema);

module.exports = User;
