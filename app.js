'use strict'

const filesys = require("fs")
const http = require("http")
const path = require("path")
const url = require("url")

const express =  require('express')
const session = require('express-session')
const request = require('request')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({secret:'secret', saveUninitialized:true, resave: true}))
let sess;

let ejs = require('ejs')
const router = express.Router()


app.set("view engine", 'ejs')
app.set("ejs", require('ejs').__express)


router.get('/', (req, res) => {
    sess = req.session;
    res.render("index", {pagename: "HOME",  sess:sess})
})

router.get('/about', (req, res) => {
    sess = req.session;
    res.render("about", {pagename: "ABOUT",  sess:sess})
})

router.get('/registry', (req, res) => {
    sess = req.session;
    res.render("registry", {pagename: "REGISTRY",  sess:sess})
})
router.post('/registry', (req, res) => {
    sess = req.session;
    let {user, pass, name, address, city, state, zip, gender, consent, age, bio} = req.body

    let errors = []
    if(name == ''){ errors.push('Name is empty')}
    if(/^[a-zA-Z\s]*$/.test(name) == ''){ errors.push('Invlid name')}
    if(address == ''){ errors.push('addres is empty')}
    if(city == ''){ errors.push('city is empty')}
    if(!/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(city)){ errors.push('Invalid city name')}
    if(state == ''){errors.push('state is empty')}
    if(!/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(state)){ errors.push('invalid state name')}
    if(zip == ''){errors.push('zip code is empty')}
    if(!/^\d{5}$|^\d{5}-\d{4}$/.test(zip)){errors.push('Invalid zip code')}
    if(gender == "undefined"){ errors.push('Need to check a gender')}
    if(consent != "consented"){ errors.push('We need consent in order to continue')}
    if(bio.length <= 50){ errors.push('Need at least 50 character in your bio')}

    

    if(errors.length > 0){
        res.render('registry', { pagename: "REGESTRY", errors:errors})
    } else {
        sess.username = user
        sess.password = pass
        sess.name = name
        sess.address = address
        sess.city = city
        sess.state = state
        sess.zip = zip
        sess.gender = gender
        sess.consent = consent
        sess.age = age
        sess.bio = bio
        sess.logged = true
        res.render('profile', {pagename: 'PROFILE', sess:sess})
    }
   
})

router.get('/login', (req, res) => {
    sess = req.session;
    res.render("login", {pagename: "LOGIN",  sess:sess})
})

router.post('/login', (req, res) => {
    sess = req.session;
    let {email, pass } = req.body
    let errors = []
    console.log(`${email}  ${pass}`)
    if( email != 'Mike@aol.com' || pass != 'abc123') {
      errors.push("Invalid email and password")
    }
    
    if(errors.length > 0){
        res.render('login', { pagename: "LOGIN", errors:errors})
    } else {
        sess.email = email
        sess.password = pass
        sess.logged = true
        res.render('profile', {pagename: 'PROFILE', sess:sess})
    }
   
})

router.get('/profile',(req,res) => {
    sess = req.session
    if(typeof(sess) == 'undefined' || sess.logged != true){
       res.render('index', {pagename: 'HOME', error: 'User not authenticated'})
    } else {
        res.render('profile', {pagename: 'PROFILE', sess:sess})
    }
})

router.get('/logout', (req, res)=> {
   req.session.destroy(err => {
       res.redirect('/')
   })
})

app.use(express.static('public'))
app.use('/',router)

let server = app.listen('8080', (port) => {
    console.log(`port is running on ${port}`)
})