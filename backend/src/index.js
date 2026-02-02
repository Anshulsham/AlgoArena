const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
// This line ALREADY starts the Redis connection because of the code we wrote previously
const redisClient = require('./config/redis'); 
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const discussionRouter = require("./routes/discussionRoutes");
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use("/discuss", discussionRouter);

const InitalizeConnection = async ()=>{
    try{
        // FIX: Removed redisClient.connect() because it's already connected!
        await main(); 
        
        console.log("DB Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error connection: "+err);
    }
}

InitalizeConnection();