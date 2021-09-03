const express = require('express');
const app = express();
const {pool} = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require ('express-session');
const flash = require('express-flash');
const passport = require('passport');


const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));

app.use(
    session({
        secret: "secret",

        resave: false,

        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get('/', (req,res)=>{
    res.render('index');
});

app.get('/users/login', checkAutenticated, (req, res)=>{
    res.render('login')
});

app.get('/users/register', checkAutenticated, (req, res)=>{
    res.render('register')
});

app.get('/users/dashboard', checkNotAutenticated, (req, res)=>{
    res.render('dashboard', {user: req.user.name});
});

app.get('/users/logout', (req, res)=>{
    req.logOut();
    req.flash("success_msg", "Çıkış yaptınız.");
    res.redirect('/users/login');
});

app.get('/calculator', checkNotAutenticated, (req, res)=>{
    res.render('calculator', {user: req.user.name});
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
    let success = [];

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
            `SELECT * FROM users
            WHERE email = $1`, 
            [email], 
            (err, result)=>{
                if (err){
                    throw err;
                }

                console.log(result.rows);

                if(result.rows.length > 0){
                    success.push({message: "Email kaydedildi."});
                    res.render('register', {success})
                }else{
                    pool.query(
                        `INSERT INTO users (name, email, password)
                        VALUES ($1, $2, $3)`, 
                        [name, email, hashedPassword],
                        (err, result)=>{
                            console.log(err);
                            req.flash('success_msg', "Kaydoldunuz, lütfen giriş yapın");
                            res.redirect("/users/login");
                        }
                    );

                }
            }
        );
    }
});

app.post("/users/login", passport.authenticate('local',{
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true

} ));

function checkAutenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    next();
}

function checkNotAutenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/users/login');
}

app.listen(PORT, () =>{
    console.log(`server server çalışıyor port: ${PORT}`);
});


