require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        // All Collections
        const crowdCubeCollection = client.db('crowdCubeDB').collection('crowdCube');
        const userCollection = client.db('crowdCubeDB').collection('users');
        const myDonationCollection = client.db('crowdCubeDB').collection('MyDonations');

        // New Campaign data read
        app.get('/addCampaign', async (req, res) => {
            const cursor = crowdCubeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Update Campaign
        app.get('/addCampaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await crowdCubeCollection.findOne(query);
            res.send(result);
        })

        // Details Campaign
        app.get('/running/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await crowdCubeCollection.findOne(query);
            res.send(result);
        });

        // Six Data Limit
        app.get("/running", async (req, res) => {
            try {
                const campaigns = await crowdCubeCollection.find().toArray();
                const currentDate = new Date();
                const filteredCampaigns = campaigns
                    .filter((campaign) => new Date(campaign.deadline) >= currentDate)
                    .slice(0, 6);
                res.send(filteredCampaigns);
            } catch (error) {
                console.error("Error fetching running campaigns:", error);
                res.status(500).send({ message: "Error fetching running campaigns." });
            }
        });

        // Sort Ascending Order
        app.get("/campaigns/sortedByDonation", async (req, res) => {
            const campaigns = await crowdCubeCollection.find().toArray();
            const sortedCampaigns = campaigns.sort((a, b) => {
                return parseFloat(a.minDonation) - parseFloat(b.minDonation);
            });
            res.send(sortedCampaigns);
        });

        // My Donations
        app.get('/myDonations', async (req, res) => {
            const cursor = myDonationCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // New Campaign Receive
        app.post('/addCampaign', async (req, res) => {
            const newCampaign = req.body;
            console.log(newCampaign);
            const result = await crowdCubeCollection.insertOne(newCampaign);
            res.send(result);
        })

        // My Donation Post
        app.post('/myDonations', async (req, res) => {
            const donations = req.body;
            const result = await myDonationCollection.insertOne(donations);
            res.send(result);
        })

        // Update Campaign
        app.put('/addCampaign/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCampaign = req.body;
            const campaign = {
                $set: {
                    image: updatedCampaign.image,
                    title: updatedCampaign.title,
                    type: updatedCampaign.type,
                    description: updatedCampaign.description,
                    minDonation: updatedCampaign.minDonation,
                    deadline: updatedCampaign.deadline
                }
            }
            const result = await crowdCubeCollection.updateOne(filter, campaign, options);
            res.send(result);
        })

        // Delete Campaign
        app.delete('/addCampaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await crowdCubeCollection.deleteOne(query);
            res.send(result);
        })

        // User Related API
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log('creating new user', newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('CrowdCube server is running')
})

app.listen(port, () => {
    console.log(`CrowdCube server is running on port: ${port}`)
})