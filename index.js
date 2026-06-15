const express = require("express");
const cors = require("cors");
const env = require("dotenv");
env.config();

const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());

console.log(PORT);

app.get("/", async (req, res) => {
    res.send("Vamos Argentina!")
})

app.listen(PORT, () => {
    console.log(`Listening to port: http://localhost:${PORT}`)
})