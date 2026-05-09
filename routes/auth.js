//här är routes för webbserver

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//hämta modellen från User.js
const User = require("../models/User");

//middleware för jwt. Kallas på av router.get("/profile")
function auth(req, res, next){
    //req.headers = alla headers i request
    //authorization specificerad auth-header (om den finns, annars undefined)
    // ?. optional chaining. Ska förhindra krasch om header saknas
    //split(" ") för att dela sträng vid mellanslag (Bearer ey12klM...). 
    // [1] tar index 1 för att plocka ut JWT-token, mao det som kommer efter Bearer ovan
    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({ error: "Ingen token har försetts" });
    }
    try{

        //kontrollerar att token är äkta/giltig, att den inte har ändrats
        //använder servers hemliga nyckel
        //om ok, får tillbaka innehållet i token => användardata
        //verify kommer från jsonwebtoken
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //när ovan är ok, spara användardata i req.user
        req.user = decoded;
        console.log("Auth header", req.headers.authorization);
        console.log("Token: ", token);
        //next() => första delen i kedjan är ok, så gå vidare till nästa steg i kedjan (se route.get("/profile"))
        next();
    }catch{
        return res.status(401).json({ error: "Ogiltig token" });
    }
}

//registrera användare
router.post("/register", async (req, res) => {
    try{

        //variabel för användarnamn, email och lösenord när ny användare ska registreras
        const {username, email, password } = req.body;
        
        if(!username || !email || !password){
            return res.status(400).json({ error: "Ogiltigt input: skriv in användarnamn, email och lösenord" });
        }

        //kontroll om mail redan existerar
        const emailExists = await User.findOne({ email });
        if (emailExists){
            return res.status(400).json({ error: "Email används redan" });
        }

        //kontroll om användarnamn redan existerar
        const usernameExists = await User.findOne({ username });
        if(usernameExists){
            return res.status(400).json({ error: "Användarnamnet används redan"})
        }
        
        //kryptera lösenord. 10 är standard, bestämmer hur tung beräkning blir (hur svårt det är att knäcka lösenord)
        const cryptPass = await bcrypt.hash(password, 10);
        const user = await User.create({
            username, email, password: cryptPass //krypterat lösenord
        });
        res.status(201).json({ message: "Användare skapad"});
    }catch (err){
        res.status(400).json({ error: "Kunde inte skapa användare" });
    }
})

//logga in användare
router.post("/login", async (req, res) => {
    try{

        //variabel där användarnamn och lösenord hämtas från frontend
        const { username, password } = req.body;

        //om inget finns, visa fel
        if(!username || !password){
            return res.status(400).json({ error: "Vänligen skriv in både användarnamn och lösenord" });
        }

        //kontroll: finns användarnamnet i databasen?
        const user = await User.findOne({ username });

        //om ingen användare finns, visa fel
        if(!user){
            return res.status(400).json({ error: "Användare hittades inte" });
        }

        //kontroll ifall lösenordet stämmer överens. compare kommer från bcryptjs
        const isMatched = await bcrypt.compare(password, user.password);

        if(!isMatched){
            return res.status(400).json({ error: "Fel lösenord" });
        }
        //skapa en token som innehåller användarens info. Giltig i 1h
        //data packas in - kallas tydligen payload? (id, username)
        //signerar med JWT_SECRET - skapar digital signatur på token, men inte kryptering
        //giltig i 1 timme.
        const token = jwt.sign(
            //detta är payload (information som sparas i token)
            {
                id: user._id,
                username: user.username
            },
            //secret (används för att signera token, skapa signatur)
            process.env.JWT_SECRET,
            //options (inställningar för token)
            //token är giltig i en timme. Sedan krävs ny inloggning
            {expiresIn: "1h" }
        );
        res.json({ message: "Lyckat login", token });
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
})

//skyddad route. 
// middleware funktion auth körs först: 
// -verifiering av token, 
// -hämtar användardata 
// -sparar användaren i req.user
//next() ser till att denna route går igång

router.get("/profile", auth, async (req, res) => {
    try{
        //hämta användare via id. 
        //uteslut lösenord i responsen
        //ska skydda så att backend inte råkar skicka lösenord
        const user = await User.findById(req.user.id).select("-password");
        //ingen user = 404
        if(!user){
            return res.status(404).json({ error: "Användare hittades inte" });
        }
        res.json({ message: "Detta är skyddad data", user });
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
})

router.delete("/user", auth, async (req, res) => {
    try{
        const userId = req.user.id;
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            return res.status(404).json({ error: "Användare hittades inte" });
        }
        res.json({ message: "User deleted successfully!" });
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
})

module.exports = router;