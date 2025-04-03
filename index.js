require("dotenv").config();
const connectDb = require("./utils/db")
connectDb();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const auth = require("./middlewares/auth");
const User = require("./models/User");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

require('./utils/auth')
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "API",
            version: "1.0.0",
            description: "A simple express library api"
        },
        servers: [
            {
                url: "http://localhost:9000"
            }
        ]
    },
    apis: ['./routes/*.js']
}
const specs = swaggerJsDoc(options)

// const swaggerDocument = {
//     openapi: '3.0.0', // Correct version field
//     info: {
//       title: 'App API',
//       description: 'API for managing modules in the system',
//       version: '1.0.0'
//     },
//     servers: [
//       {
//         url: 'http://localhost:9000',
//         description: 'Local server'
//       }
//     ]
// }

// swaggerDocument.apis = ['./routes/*.js']; // Path to the API docs



const app = express();


app.use(cors({origin: "*"}));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
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


app.get("/", (req,res)=>{
    res.json("landing page")
})

app.use("/auth", require("./routes/auth"))
app.get("/another", auth, (req,res)=> {
    res.json("Another api")
})

app.get("/users", auth, (req,res)=> {
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