require('dotenv').config;
require('./db');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./user.model');
const { sha256 } = require('js-sha256');
const http = require('http')
const morgan = require('morgan');

const app = express();

const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server, {cors: {
    origin: '*',
  }});


io.on('connection', (socket) => {
    let user;

    socket.on('connected', (name) => {
        console.log(name)
        user = name;
        let nam = name
        socket.broadcast.emit('alert', {
            msg: `${nam} has entry to room`
        });
    });

    socket.on('message', (name, message) => {
        console.log(message);
        io.emit('messages', {name, message});
    })

    socket.on('typing', (name) => {
        console.log(name)
        let nam = name
        if(nam == ''){
            socket.broadcast.emit('typing', {
                msg: ''
            });
        }else{
            socket.broadcast.emit('typing', {
                msg: `${nam} is typing`
            });
        }        
    });
})

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

app.set('Port', process.env.PORT || 4000);

app.get('/', (req, res) => {
    res.send('here');
})

app.post('/createuser', cors(), async (req, res) => {
    const {username, password, confirmPassword} = req.body || '';
    if(password == confirmPassword){
        const user = await User.findOne({username: username});
        if(!user){
            const newUser = new User({ username, password });            
            newUser.password = sha256(password);
            await newUser.save();    
            res.json({msg: 'success'});
        }else{
            res.json({msg: 'The user already exist'})
        }
    }else{
        res.json({msg: 'The passwords are not the same'});
    }
})

app.post('/login', cors(), async (req, res) => {
    const {username, password} = req.body || '';
    const user = await User.findOne({username: username});
    
    if(user){
        const passVery = sha256(password)
        if(passVery == user.password){
            res.json({userid: user._id});
        }else {
            res.json({msg: 'The passwords are not the same'})
        }
    }else{
        res.json({msg: 'The user not exist'})
    }
})

app.get("/user/:id", cors(), async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);    
    res.json({msg: user.username});
})

app.delete('/user/:id', cors(), async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.json({msg: 'success'});
})

app.put('/user/:id', cors(), async (req, res) => {
    const id = req.params.id;
    const {username} = req.body || '';
    const user = await User.findById(id);
    user.username = username;
    await User.findByIdAndUpdate(id, user);
    res.json('success');
})

server.listen(app.get('Port'), () => {
    console.log('Server started');
})