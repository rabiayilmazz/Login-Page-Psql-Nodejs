const express = require('express');
const app = express();
const {pool} = require("./dbConfig");
const bcrypt = require('bcrypt');

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

app.post('/users/register', async (req, res)=>{
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
    }else{
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            `Select * from users
            where email= $1,` [email], (err, result)=>{
                if(err){
                    throw err;
                }

                console.log(result.rows);
            }
        )
    }
})
app.listen(PORT, () =>{
    console.log(`server server çalışıyor port: ${PORT}`);
});


