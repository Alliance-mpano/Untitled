const jwt = require("jsonwebtoken")
const User = require("../models/User.js");

module.exports = async function verifyToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied" });
  
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.AUTH_KEY);
        req.user = await User.findById(decoded.userId);
        console.log("🔹 Decoded User:", req.user);
        next();
    } catch (err) {
      console.log(err)
        res.status(400).json({ error: "Invalid token" });
    }
  }