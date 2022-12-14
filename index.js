const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000

// middle ware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2elctou.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded) {
        if(error) {
            res.status(401).send({message: 'unauthorized Access'})
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try{
        const servicesCollection = client.db('photography').collection('services');
        const reviewsCollection = client.db('photography').collection('reviews');

        // jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({token})
        })

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

        // service add
        app.post('/services', async(req, res) => {
            const services = req.body;
            const result = await servicesCollection.insertOne(services);
            res.send(result)
        })

        // reviews
        app.get('/reviews',verifyJWT, async(req, res) => {
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'Forbidden access'})
            }
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

        app.get('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const reviews = await reviewsCollection.findOne(query);
            res.send(reviews)
        })
        
        app.post('/reviews', async(req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.send(result);
        })

        // update review
        app.put('/reviews/:id',verifyJWT, async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const review = req.body;
            const option = {upsert: true};
            const updateReview = {
                $set: {
                    message: review.message,
                }
            }
            const result = await reviewsCollection.updateOne(filter, updateReview, option)
            res.send(result)
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