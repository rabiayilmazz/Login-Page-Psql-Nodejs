const express = require('express');
const app = express();
const {pool} = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require ('express-session');
const flash = require('express-flash');
const passport = require('passport');
const morgan = require('morgan');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const knex = require('knex');
// Create database object
const db = knex(
    {
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'rabia',
            password: '1234',
            database: 'image_upload',
        },
    }
);

const imageUpload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'images/');
            },
            filename: function (req, file, cb) {
                cb(
                    null,
                    new Date().valueOf() + 
                    '_' +
                    file.originalname
                );
            }
        }
    ), 
});

app.use(express.static("public"));

const kelimeler = ["panda", "ağaç", "staj", "haber", "yazılım", "usishi", "buluthan", "bilgisayar", "kitap"];

let harfler = ["a", "b", "c", "ç", "d", "e","f", "g", "ğ", "h", "ı", "i","j" ,"k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t","u", "ü", "v", "y", "z"];
let kelime;
let kelime_ekran;
let kelime_kontrol;
let hak = 0;
let sembol = "_ ";
let harf_get;
var sayac = 0;
var kontrol;

kelime = kelime_sec(kelimeler); 
kelime_ekran = bos_harf(kelime);
kelime_kontrol = harf(kelime);

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));

app.use(express.json());
app.use(morgan('dev'));

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

app.get('/calculator', checkNotAutenticated, (req, res)=>{
    res.render('calculator', {user: req.user.name});
});

app.get('/hangman', checkNotAutenticated, function(req, res) { 
    hak = 0;
    kelime = kelime_sec(kelimeler); 
    sonuc = true;
    kelime_ekran = bos_harf(kelime);
    kelime_kontrol = harf(kelime);
    res.render('hangman',{kelime: kelime, kelime_ekran: kelime_goster(kelime_ekran), hak:hak, harf:req.params.harf, harfler:harfler, sonuc:kazandiniz()}); 
    
    res.end();  
});

app.get('/hangman/temizle', checkNotAutenticated, function(req, res) { 
    hak = 0;
    sonuc = true;
    kelime_ekran = bos_harf(kelime);
    kelime_kontrol = harf(kelime);
    res.render('hangman',{kelime: kelime, kelime_ekran: kelime_goster(kelime_ekran), hak:hak, harf:req.params.harf, harfler:harfler, sonuc:kazandiniz()}); 
    res.end();  
});

app.get('/hangman:harf', function(req, res) { 
    sayac++;
    kontrol = kelime.includes(req.params.harf);
    
        if(kontrol == false){
            hak++;
        }
    
    kelime_ekran = doldur(req.params.harf, kelime, kelime_ekran);
    res.render('hangman', { kelime: kelime, kelime_ekran: kelime_goster(kelime_ekran), hak : hak, harf:req.params.harf, harfler:harfler, sonuc:kazandiniz()});
    res.end();
    });

app.get('/files', function(req, res) { 
    
    res.render('files');  
});

app.post('/upload', function(req, res){ 
    res.render('files')
    
    if (req.url == '/upload') {
        let veriler = '';
        req.on('data', veri => veriler += veri);
        req.on('end', () => console.log("değerler" + veriler));
    }
});

app.get('/:filename', upload.single('avatar'), (req, res, next) => {
    const { path, mimetype } = req.file 
    const img = fs.readFileSync(path)
    const encodedImg = img.toString('base64');
    const finalImg = {
      contentType: mimetype,
      image:  new Buffer(encodedImg, 'base64')
    }  
    if (!req.file) 
        return res.send('Please upload a file') ; 
    res.sendStatus(200)
  });



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

function kelime_sec (dizi){
    let r = Math.floor(Math.random() * dizi.length);
    return dizi[r];
} 

function kelime_goster(dizi){
    var metin = "";
    
    dizi.forEach(element => {
    metin += element;
    });
    return metin;
}

function harf(kelime){
    var dizi_harf = [];
    var uzunluk = kelime.length;

    for ( var i=0; i < uzunluk ; i++) { 
        dizi_harf[i] = kelime.substr(i,1);
    }

    return dizi_harf;
}

function bos_harf(kelime){
    var dizi_harf = [];
    var uzunluk = kelime.length;

    for (var i=0; i < uzunluk ; i++) { 
        dizi_harf[i] = sembol;
    }

    return dizi_harf;
}

function doldur(harf,kelime,kelime_ekran){
    for (var key in kelime) {
        if (kelime[key] == harf) {
            kelime_ekran[key] = harf;
        } 
    }
    return kelime_ekran;	
}

function kazandiniz(){
    var sonuc = kelime_ekran.includes(sembol);
    return sonuc;
}

app.listen(PORT, () =>{
    console.log(`server server çalışıyor port: ${PORT}`);
});

