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

app.post('/users/register', (req, res)=>{
    let {name, email, password, password2} = req.body;

    console.log({
        name, 
        email, 
        password, 
        password2
    });

    let errors = [];

    if(!name || !email || !password || !password2){
        errors.push({message: "Bütün alanları eksiksiz doldurun!"});
    }
    
    if(password.length < 6){
        errors.push({message: "Parola 6 karakterden büyük olmalı"});
    }

    if(password!=password2){
        errors.push({message: "Parolalar eşleşmiyor."});
    }

    if(errors.length>0){
        res.render('register', {errors});
    }
})
app.listen(PORT, () =>{
    console.log(`server server çalışıyor port: ${PORT}`);
});


