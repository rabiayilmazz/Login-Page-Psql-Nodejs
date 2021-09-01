const express = require('express');
const app = express();
const {pool} = require("./dbConfig");

const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}))

app.get('/', (req,res)=>{
    res.render('index');
});

app.get('/users/login', (req, res)=>{
    res.render('login')
});

app.get('/users/register', (req, res)=>{
    res.render('register')
});

app.get('/users/dashboard', (req, res)=>{
    res.render('dashboard', {user: 'Rabia'});
});

app.listen(PORT, () =>{
    console.log(`server server çalışıyor port: ${PORT}`);
});


