const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.td56s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //Marathon APIs
    const marathonsCollection = client.db('marathonManagemt').collection('marathons');
    const marathonRegisterCollection = client.db('marathonManagemt').collection('marathon-applications');
    

    app.get('/marathons', async(req, res) => {
        const cursor = marathonsCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/marathons/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await marathonsCollection.findOne(query)
      res.send(result)
    })

    app.post('/marathons' , async(req,res) => {
      const newMarathon = req.body;
      const result = await marathonsCollection.insertOne(newMarathon)
      res.send(result)
    })

    //Marathon Register Api

    app.get('/marathon-register', async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email }
      const result = await marathonRegisterCollection.find(query).toArray();

      for (const application of result) {
        const query1 = { _id: new ObjectId(application.marathon_id) }
        const marathon = await marathonsCollection.findOne(query1);
        if (marathon) {
            application.title = marathon.title;
            application.photoURL = marathon.photoURL;
            application.description = marathon.description;
            application.marathonStart = marathon.marathonStart;
            application.distance = marathon.distance;
            application.location = marathon.location;

        }
    }

      res.send(result);
    })

    app.post('/marathon-registers', async(req,res) => {
      const register = req.body;
      const result = await marathonRegisterCollection.insertOne(register);
      res.send(result)

    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) =>{
    res.send('Marathon Management Is running')
})

app.listen(port , ()=>{
    console.log(`Marathon Is Waiting at : ${port}`)
})