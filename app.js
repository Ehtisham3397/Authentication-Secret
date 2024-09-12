require('dotenv').config()

const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

const app = express()
console.log(process.env.API_KEY)

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"))

//connecting to MongoDB server using Mongoose
mongoose.connect("mongodb://localhost:27017/userDB").then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
})

//Proper schema using mongoose Schema library
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

//creting a string used for encryption
const secret = process.env.SECRET //getting secret key from evn variable

//pluging In encryption into the schema
userSchema.plugin(encrypt, { secret: secret, encryptedFields:["password"] })

const User = mongoose.model("User", userSchema)

app.get("/", (req,res)=>{
    res.render("home")
})

app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/register", (req,res)=>{
    res.render("register")
})

app.post("/register", (req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save().then((user) => {
        console.log("User's password was: " + user.password)
        console.log('New User added to database successfuly');
        res.render("secrets")
    }).catch(err => {
        console.error('Error in registering new User:', err);
    })
})

app.post("/login", (req,res)=>{
    const username = req.body.username
    const password = req.body.password

    User.findOne({email: username}).then((foundUser) =>{
        console.log("User found in the database")
        if(foundUser.password === password){
            console.log("User's password was: " + foundUser.password)
            res.render("secrets")
            console.log("User login: As all the correct details")
        } else {
            console.log("Password is not correct")
        }
    }).catch(err => {
        console.error('Error in finding user:', err);
    })

})

app.listen(3000, function(){ 
    console.log("Server is listening on port 3000")
})