require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

//skapa server
const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//hämta routes från auth.js
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

//anslut till MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        //nedan för att kunna se vad databasen heter, ska ta bort senare
        console.log("DB NAME:", mongoose.connection.name);
    })
    .catch(err => console.log(err)); 

app.get("/", (req, res) => {
    res.send("API server fungerar!");
})

app.listen(PORT, () => {
    console.log("Server fungerar på port " + PORT);
})