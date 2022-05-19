const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    //get single product by id
    app.get('/product/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const product = await productCollection.findOne(query);
        res.send(product);
      })
    //create product
    app.post("/product",async(req,res)=>{
        const data = req.body;
        const result = await productCollection.insertOne(data);
        res.send(result);
    })
    //update delevered product quantity
    app.put("/product/:id",async(req,res)=>{
        const id = req.params.id;
        const query = {}
        
        const data = req.body.quantity;
        console.log(data);
         const newData = data - 1;
        // console.log(newData);
        const filter = {_id:ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                quantity: newData
            }          
        };
        const result = await productCollection.updateOne(filter,updateDoc,options);
        console.log(result);
        res.send(result);
    })
    //update stock
   
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