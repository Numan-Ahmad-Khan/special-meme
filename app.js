require('dotenv').config();
const express = require("express")
const app = express()
const db =require("./database/Postgres")
const port = 3000

const payment = require("./routes/payment");
const rawBody = express.raw({type: "application/json"});
app.use("/payment", rawBody, payment);

app.use(express.json())
async function startServer() {
    try {
        await db.sync({ alter: true });
        console.log('PostgreSQL database tables synchronized successfully.');

        app.listen(port, () => {
            console.log(`Running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to sync database or start server:', error);
        process.exit(1);
    }
}

app.get("/", (req,res)=>{
    res.send("Hello")
})
const auth = require("./routes/auth")
app.use("/", auth)

const user = require("./routes/user")
app.use("/", user)

const admin = require("./routes/admin")
app.use("/", admin)

const otp = require("./routes/otp")
app.use("/", otp)

const rider = require("./routes/rider")
app.use("/", rider)
startServer()

module.exports = app;