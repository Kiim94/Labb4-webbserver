require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

//skapa server
const app = express();
const PORT = process.env.PORT || 3000;

//middleware
//tillåt localhost:5173 för vite-frontend, och webbserver länken för publicerad frontend
app.use(cors({
    //origin: "vilka webbplatser får anropa mitt api"
    origin:[
        "http://localhost:5173",
        "https://laboration4.netlify.app"
    ]
}));

app.use(express.json());

//hämta routes från auth.js
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

//anslut till MongoDB
async function startServer(){
    try{
        if(!MONGO_URI){
            console.error("MONGO_URI saknas i .env");
            process.exit(1)
        }
        await mongoose.connect(MONGO_URI);
        console.log("Uppkopplad till MongoDB");
        app.listen(PORT, () => {
            console.log("API fungerar på port: " + PORT);
        });
    }catch(err){
        console.error("Kunde inte ansluta till MongoDB:", err);
        process.exit(1);
    }
}

startServer();