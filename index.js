const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        const bookings = db.collection("bookings");

        /** 
         * Find relevant tutor.
        */
        const findTutor = async (id) => {
            const query = {
                _id: new ObjectId(id)
            };

            const tutor = await tutors.findOne(query);

            return tutor;
        };

        /**
         * GET tutors route
        */
        app.get("/tutors", async (req, res) => {
            const allTutors = tutors.find();
            if (tutors) {
                const result = await allTutors.toArray();
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

        /**
         * GET dynamic tutor route
        */
        app.get(`/tutors/:id`, async (req, res) => {
            const result = await findTutor(req.params.id);
            res.send(result);
        });

        /**
         *  PATCH tutor route
        */
        app.patch("/tutors/:id", async (req, res) => {
            const query = {
                _id: new ObjectId(req.params.id)
            };
            if (req.body.updateAll) {
                const { name, image, subject, days, fee, slot, institute, location, mode, start } = req.body;
                const updatedTutor = {
                    $set: {
                        name: name,
                        image: image,
                        subject: subject,
                        days: days,
                        fee: fee,
                        slot: slot,
                        institute: institute,
                        location: location,
                        mode: mode,
                        start: start,
                    }
                }
                const result = await tutors.updateOne(query, updatedTutor);

                res.send(result);
            } else {
                /**
                 *  Will cause failure on race condition if two users simulataenously book.
                
                const previousState = await findTutor(req.params.id);
    
                const updatedSlot = {
                    $set: {
                        slot: Number(previousState.slot) + Number(req.body.slot)
                    }
                };
    
                */

                // Atomic approach.
                const updatedSlot = {
                    $inc: {
                        slot: Number(req.body.slot)
                    }
                };

                const result = await tutors.updateOne(query, updatedSlot);

                res.send(result);
            }
        });

        /**
         * DELETE tutors route
         */
        app.delete("/tutors/:id", async (req, res) => {
            const query = {
                _id: new ObjectId(req.params.id),
            };

            const result = await tutors.deleteOne(query);

            res.send(result);
        })

        /**
         *  GET my-tutors route
        */
        app.get("/myTutors/:userId", async (req, res) => {
            const query = {
                userId: req.params.userId
            };

            const result = await tutors.find(query).toArray();

            res.send(result);
        })

        /**
         * GET bookings route.
         */
        app.get("/bookings/:id", async (req, res) => {
            const query = { userId: req.params.id };

            const result = await bookings.find(query).toArray();

            res.send(result);
        })

        /**
         * POST bookings route.
        */
        app.post("/bookings", async (req, res) => {
            const newBooking = req.body;

            const result = await bookings.insertOne(newBooking);

            res.send(result);
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
