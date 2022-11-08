const express = require('express')
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000

// middle ware
app.use(cors())
app.use(express.json())

// user: photographyUser
// pass: Password243



const uri = "mongodb+srv://<username>:<password>@cluster0.2elctou.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


app.get('/', (req, res) => {
  res.send('photography server running')
})

app.listen(port, () => {
  console.log(`photography server running on port ${port}`)
})