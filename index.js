const express = require('express')
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000

// middle ware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2elctou.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const servicesCollection = client.db('photography').collection('services');
        const reviewsCollection = client.db('photography').collection('reviews');

        app.get('/services', async(req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })

        // reviews
        app.get('/reviews', async(req, res) => {
            let query = {};

            const userEmail = req.query.email;
            
            if(userEmail){
                query = {
                    email: userEmail
                }
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        
        app.post('/reviews', async(req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.send(result);
        })

        // reviews delete
        app.delete('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally{

    }
}

run().catch(error => console.log(error))


app.get('/', (req, res) => {
  res.send('photography server running')
})

app.listen(port, () => {
  console.log(`photography server running on port ${port}`)
})