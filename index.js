require("dotenv").config();
const connectDb = require("./utils/db")
connectDb();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const auth = require("./middlewares/auth");
const User = require("./models/User");

const app = express();

require('./utils/auth')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {secure: false}
}))

app.use(passport.initialize()); 
app.use(passport.session());
app.use(cors({origin: "*"}));

app.get("/", (req,res)=>{
    res.json("landing page")
})

app.use("/auth", require("./routes/auth"))
app.get("/another", auth, (req,res)=> {
    res.json("Another api")
})

app.get("/users", (req,res)=> {
    User.find({}).then((users)=>{
        res.json(users)
    })
})
app.get("/deleteusers", (req,res)=> {
    User.deleteMany({}).then(()=>{
        res.json("Delete users")
    })
})
const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})