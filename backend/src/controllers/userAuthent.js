const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")

require('dotenv').config()

const TOKEN_MAX_AGE = 60 * 60 * 1000;

const getBaseCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
});

const getAuthCookieOptions = () => ({
    ...getBaseCookieOptions(),
    maxAge: TOKEN_MAX_AGE
});


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

        res.cookie('token', token, getAuthCookieOptions());
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
        console.error("❌ REGISTER ERROR:", error);

        // MongoDB duplicate key error — don't leak DB details to client
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

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

        if(!user)
            return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            return res.status(401).json({ message: "Invalid credentials" });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,getAuthCookieOptions());
        res.status(201).json({
            user:reply,
            message:"Login Successfully"
        })
    }
    catch(err){
        console.error("login error:", err);
        res.status(401).json({ message: "Invalid credentials" });
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

    res.clearCookie("token", getBaseCookieOptions());
    res.send("Logged Out Succesfully");

    }
    catch(err){
        console.error("logout error:", err);
       res.status(503).json({ message: "Logout failed" });
    }
}


const adminRegister = async(req,res)=>{
    try{
      validate(req.body);
      const { firstName, emailId, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        firstName: firstName,
        emailId: emailId,
        password: hashedPassword,
        role: 'admin'
      };

      const user = await User.create(userData);
      const token = jwt.sign(
        { _id: user._id, emailId: emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: 60 * 60 }
      );

      res.cookie('token', token, getAuthCookieOptions());
      res.status(201).json({
        user: {
          firstName: user.firstName,
          emailId: user.emailId,
          _id: user._id,
          role: user.role,
        },
        message: "Admin Registered Successfully"
      });
    }
    catch(err){
        console.error("adminRegister error:", err);

        // MongoDB duplicate key error — don't leak DB details to client
        if (err.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        res.status(400).json({ message: err.message || "Registration failed" });
    }
}

const deleteProfile = async(req,res)=>{

    try{
       const userId = req.result._id;

    // Delete user
    await User.findByIdAndDelete(userId);

    // Delete all submissions by this user
    await Submission.deleteMany({userId});

    // Delete all discussions authored by this user
    const Discussion = require("../models/Discussion");
    await Discussion.deleteMany({ author: userId });

    // Delete all comments authored by this user
    const Comment = require("../models/Comment");
    await Comment.deleteMany({ author: userId });

    // Clear the auth cookie
    res.clearCookie("token", getBaseCookieOptions());

    res.status(200).json({ message: "Profile deleted successfully" });

    }
    catch(err){
        console.error("delete error:", err);
        res.status(500).json({ message: "Failed to delete profile" });
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
