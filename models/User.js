//nedan är Schema för data för varje objekt. Tanken är att användarnamn, lösenord och email måste finnas
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true
    }
}, {timestamps: true});

//modell av schema
module.exports = mongoose.model("User", userSchema);