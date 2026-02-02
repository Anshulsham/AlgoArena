const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")

require('dotenv').config()


const register = async (req, res) => {
    try {
        console.log("1. Received Body:", req.body);

        // 1. Validation
        validate(req.body); 
        console.log("2. Validation Passed");

        // 2. Hash Password
        const { firstName, emailId, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User Object explicitly 
        // (This prevents issues if req.body has extra junk)
        const userData = {
            firstName: firstName,
            emailId: emailId,      // CHECK: Does your Model use 'email' or 'emailId'?
            password: hashedPassword,
            role: 'user'
        };

        console.log("3. Saving to MongoDB...", userData);
        
        const user = await User.create(userData);
        console.log("4. User Created Successfully:", user._id);

        // 4. Generate Token
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
            },
            message: "Login Successfully"
        });

    } catch (error) {
        // ✅ FIX: Log the REAL error object
        console.error("❌ REGISTER ERROR:", error); 
        
        res.status(400).json({ 
            message: error.message || "Registration Failed"
        });
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Email Credentials");
        if(!password)
            throw new Error("Invalid Password Credentials");

        const user = await User.findOne({emailId});

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Login Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        console.error("login error:", err.response?.data);
        res.status(401).send("Error: "+err);
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);


        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
        console.error("logout error:", err.response?.data);
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        console.error("adminRegister error:", err.response?.data);
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
        console.error("delete error:", err.response?.data);
        res.status(500).send("Internal Server Error");
    }
}

const getUserProfile = async (req, res) => {
    try {
        // req.result is populated by your auth middleware
        // We return the fresh user data from the database
        const user = await User.findById(req.result._id); 
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send("Error fetching profile");
    }
};

module.exports = {register, login,logout,adminRegister,deleteProfile,getUserProfile};