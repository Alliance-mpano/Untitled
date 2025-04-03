const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const mongoose = require("mongoose")
const { sendVerificationEmail, verifyToken } = require('../helpers/email.js'); // Import the email helper functions

exports.Register = async(req,res)=>{
    const {username, email, password} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if (existingUser) return res.send("Email already registered");
        const password = String(req.body.password);  // Ensure it's a string
        const salt = await bcrypt.genSalt(10);  // Generate salt
        const hashedPassword = await bcrypt.hash(password, salt);
        
        try {
            const token = jwt.sign({ email }, process.env.AUTH_KEY, { expiresIn: "1h" });
            const response = await sendVerificationEmail(email, token);
            console.log(response);
            // Save user with verified status as false
            await User.create({username, email, password:hashedPassword, verified: false});
            res.status(200).send('Verification email sent!');
        } catch (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        }
    }catch(err){
        console.log(err)
        res.status(401).send("Error registering user.")
    }
}

exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, process.env.AUTH_KEY, { expiresIn: "1h" });
            console.log(user.verified);
            if (!user.verified) {
                try{
                    const response = await sendVerificationEmail(email, token);
                    console.log(response);
                } catch (error) {
                    console.log(error);
                    return res.status(500).send('Error sending email');
                }
                return res.status(400).send('Please verify your email before logging in.');
            }

            return res.status(200).send({ error: false, message: "Logged in successfully", token });
        }
        
        return res.status(401).send({ error: "Incorrect email or password" });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
};

exports.Logout = (req,res) => {
    res.send("Logged out successfully");    
}
exports.Dashboard = (req, res) => {
    res.send(`Welcome ${req.user.username || req.user.email}`);
}
//   exports.getUser = async(req,res)=>{
//     try{
//       let userId = req.user?.userId;
//       let info = await User.findOne({_id: mongoose.Types.ObjectId(userId)});    
//        return res.status(200).json(info);
//     }
//     catch(error){
//      console.log(error)
//      res.status(400).json(error)
//     }
//   }
