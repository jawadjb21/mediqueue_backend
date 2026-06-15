const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");
env.config();

const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());
const client = new MongoClient(process.env.MONGO_STRING, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

app.get("/", async (req, res) => {
    res.send("Vamos Argentina!")
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db("mediqueue");
        const tutors = db.collection("tutors");

        /**
         * GET tutors route
         */
        app.get("/tutors", async (req, res) => {
            const allTutors = tutors.find();
            if (tutors) {
                const result = await allTutors.toArray();
                console.log(result);
                res.send(result);
            } else {
                console.log("No tutors found!");
            }
        });

        /**
         * POST add-tutors route
         */
        app.post("/add-tutors", async (req, res) => {
            const newTutor = req.body;

            const result = await tutors.insertOne(newTutor);

            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

app.listen(PORT, () => {
    console.log(`Listening to port: http://localhost:${PORT}`)
});

run().catch(console.dir);
