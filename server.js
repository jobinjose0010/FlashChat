const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/user');
const LocalStatergy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const nodemailer = require('./mail');
var _tempData = null;
var _OTPToken = null;
const usernames={};
var rooms = [];

mongoose.connect('mongodb://localhost/flashchat');

const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(require('express-session')({
    secret: 'flashchat is a messaging app',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStatergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/',(req,res) => {
    res.redirect('/home');
});

app.get('/home',(req,res) => {
    res.render('index');
});

app.get('/register',(req,res) => {
    res.render('register');
});

app.post('/register',(req,res) => {
    _tempData = {
        fname:req.body.fname,
        lname:req.body.lname,
        gender:req.body.gender,
        dob:req.body.dob,
        username:req.body.username,
        password:req.body.password
    }
    _OTPToken = random()
    message = `your OTP is ${_OTPToken}`;
    nodemailer.sentMail(req.body.username,'Verify Account',message);
    res.render('otp',{email:req.body.username});
});

app.post('/verify/:username',function(req,res){
    if(_OTPToken == req.body.OTP){
        User.register(new User({
            fname:_tempData.fname,
            lname:_tempData.lname,
            gender:_tempData.gender,
            dob:_tempData.dob,
            username:_tempData.username
        }),_tempData.password,function(err,user){
            if(err){
                console.log(err);
                return res.redirect('/register');
            }
            _OTPToken = null;
            res.redirect('/login');
            console.log('verification sucessfully completed')
        });
    }
    else{
        res.redirect('/');
    }
    
});

app.get('/login',(req,res) => {
    res.render('login');
});

app.post('/login',(req,res) => {
    passport.authenticate('local')(req,res,function(){
        res.redirect('/flashchat/'+req.body.username);
    });
});

app.get('/flashchat/:username',isLoggedIn,(req,res) => {
        res.render('flashchat',{data:req.user});
        
});

app.get('/create',isLoggedIn,(req,res)=>{
    res.render('roomsetup',{operation:'create'});
});

app.get('/join',isLoggedIn,(req,res)=>{
    res.render('roomsetup',{operation:'join'});
});

app.post('/create',isLoggedIn,(req,res)=>{
    console.log("reached /create in post");
    rooms.push(req.body.roomname);
    console.log("pushed data");
    res.redirect('/join/'+req.body.roomname);
});

app.post('/join',isLoggedIn,(req,res)=>{
    res.redirect('/join/'+req.body.roomname);
});

app.get('/join/:room',isLoggedIn,(req,res)=>{
    res.render('chatroom',{roomname:req.params.room});
});

app.get('/logout',function(req,res){
    req.logOut();
    res.redirect('/');
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        console.log(req.user.username);
        return next();
    }
    res.redirect('/');
}

function random() {
    randnum = Math.random() * (99999 - 10000) + 10000;
    return Math.floor(randnum);
}


const server = app.listen(4000,()=>{
    console.log("FlashChat Started Sucessfully");
});

const io = require('socket.io')(server);

io.on('connection',socket => {
    socket.on('new-user',(data) =>{
        socket.username = data.name;
        socket.room = data.room;
        usernames[socket.id] = data.name;
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user-connected',data.name)
    });
    socket.on('send-chat-message',message=>{
        socket.broadcast.to(socket.room).emit('chat-message',{message:message,name:socket.username});
    });

    socket.on('disconnect',()=>{
        socket.broadcast.to(socket.room).emit('user-disconnect',socket.username);
        delete usernames[socket.id];
    });
});

