const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


//middleware
app.use(express.json())
app.use(cors({
    origin: "*"
}))



const uri = `mongodb+srv://${process.env.MD_USER}:${process.env.MD_PASS}@cluster0.rtlua5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const roomsCollection = client.db("GoldenCrest").collection("rooms");
        const bookedRoomsCollection = client.db("GoldenCrest").collection("bookedRoom");
        const reviewsCollection = client.db("GoldenCrest").collection("Reviews");

        app.get('/rooms', async (req, res) => {
            const page = req.query.page
            const limit = req.query.limit
            // console.log(pegi);
            const cursor = await roomsCollection.find().skip(parseInt(page)).limit(parseInt(limit)).toArray()
            res.send(cursor)
        })

        app.get('/reviews', async(req, res)=> {
            const cursor= reviewsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/roomsCount', async (req, res) => {
            const count = await roomsCollection.estimatedDocumentCount()
            res.send({ count })
        })

        app.get(`/rooms/:id`, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const cursor = roomsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get(`/giveReview/:id`, async (req, res) => {
            const id = req.params.id
            // console.log('66', id);
            const query = { _id: new ObjectId(id) }
            const cursor = bookedRoomsCollection.find(query)
            const result = await cursor.toArray()
            // console.log('result',result);
            res.send(result)
        })

        app.patch('/updateDate', async(req, res) => {
            const id = req.query.id
            const query = { _id: new ObjectId(id) }
            console.log('76', id);
            const newDate = req.body.booking_date
            console.log(newDate);
            const updateDoc = {
                $set: {
                    booking_date: newDate,
                }
            }
            const result = await bookedRoomsCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        app.get(`/roomReviews/:id`, async (req, res) => {
            const id = req.params.id
            // console.log('66', id);
            const query = { rooms_id: id }
            const cursor = reviewsCollection.find(query)
            const result = await cursor.toArray()
            // console.log('result',result);
            res.send(result)
        })

        app.post('/giveReview', async (req, res) => {
            const newReview = req.body
            console.log(newReview);
            const result = await reviewsCollection.insertOne(newReview)
            res.send(result)
        })

        app.patch('/rooms/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const newData = req.body.availability
            const updateDoc = {
                $set: {
                    availability: newData,
                }
            }
            const result = await roomsCollection.updateOne(query, updateDoc)
            res.send(result)

        })

        app.post('/booked', async (req, res) => {
            const newBooked = req.body
            const result = await bookedRoomsCollection.insertOne(newBooked)
            res.send(result)
        })

        app.get('/mybooking', async (req, res) => {
            const email = req.query.email
            const query = { custmer_email: email }
            const cursor = bookedRoomsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/deletebooking/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookedRoomsCollection.deleteOne(query)
            res.send(result)
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Golden Crest Server is Running')
})

app.listen(port, () => {
    console.log(`Golden Crest Server is Running on the port ${port}`);
})