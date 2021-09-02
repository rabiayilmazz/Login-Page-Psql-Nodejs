const LocalStrategy = require("passport-local").Strategy;
const { pool } = require('./dbConfig');
const bcrypt = require("bcrypt");

function initialize(passport){
    passport.use(new LocalStorage({
        usernameField: "email",
        passportField: "password"
    })
  );
}