const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrkqnje.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const menuCollection = client.db("bistroDBNew").collection("menu");
        const reviewsCollection = client.db("bistroDBNew").collection("reviews");
        const cartCollection = client.db("bistroDBNew").collection("cart");
        const userCollection = client.db("bistroDBNew").collection("user");
        // user related APIs
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const query = { email: newUser.email }
            const existingUser = await userCollection.findOne(query);
            console.log(existingUser);
            if (existingUser) {
                return res.send({})
            }
            const result = await userCollection.insertOne(newUser);
            res.send(result)
        })
        // menu related APIs
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            if (!email) {
                res.send([])
            }
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result)
        })
        app.post('/carts', async (req, res) => {
            const cartItem = req.body;
            console.log(cartItem);
            const result = await cartCollection.insertOne(cartItem);
            res.send(result)

        })
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        })
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
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
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bistro server is running');
})
app.listen(port, () => {
    console.log(`Bistro server is running on port ${port}`);
})