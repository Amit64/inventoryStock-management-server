const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const res = require("express/lib/response");

const app = express();
const port = process.env.PORT || 3006;
require("dotenv").config();

//middleware
app.use(express.json());
app.use(cors());

const uri =
      `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.pud0h.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("mcare-inc").collection("products");

    //get products
    app.get("/products",async(req,res)=>{
        const q = req.query;
        const cursor = productCollection.find(q);
        const result = await cursor.toArray();
        res.send(result);
    })
    //create product
    app.post("/product",async(req,res)=>{
        const data = req.body;
    })
   
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('we are getting data from backend');
})

app.listen(port,()=>{
    console.log('listening... port',port);
});