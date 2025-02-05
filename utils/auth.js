const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy; 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");


passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) return done(null, false, { message: "User not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: "Incorrect password" });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:9000/auth/google/callback",
}, async(accessToken, refreshToken, profile, done) => {
    try{
        let user = await User.findOne({googleId: profile.id});

        if(!user) {
            user = await User.create({googleId: profile.id, email: profile.emails[0].value, username: profile.displayName, verified: true});
        }
        const token = jwt.sign({id: user._id}, process.env.AUTH_KEY, {expiresIn: "1h"});
        return done(null, {user, token});
    }catch (err){
        return done(err);
    }
}));
