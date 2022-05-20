const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const res = require("express/lib/response");
const { status } = require("express/lib/response");

const app = express();
const port = process.env.PORT || 3006;
require("dotenv").config();

//middleware
app.use(express.json());
app.use(cors());

//virefy token
function verifyToken(req,res,next){
    const authHeader = req.headers.authorization;
    //console.log(authHeader);
    if(!authHeader){
        return res.status(401).send({messege: 'unauthorized user'})
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(403).send({messege:'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
    //console.log(token);
}

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

    //Auth
    app.post('/login',async(req,res)=>{
        const user = req.body;
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:'1d'
        });
        res.send({accessToken})

    })

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
    app.put("/product-delever/:id",async(req,res)=>{
        const id = req.params.id;
        
        const data = req.body.quantity;
        console.log('body data',data);
         const newData = data - 1;
         //console.log('updated data',newData);
        const filter = {_id:ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                quantity: newData
            }          
        };
        const result = await productCollection.updateOne(filter,updateDoc,options);
        res.send(result);
    })
   // update add to stock
    app.put("/product-restock/:id",async(req,res)=>{
        const id = req.params.id;
        const data = req.body.quantity;
        
        const filter = {_id:ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                quantity: data
            }          
        };
         const result = await productCollection.updateOne(filter,updateDoc,options);
         res.send(result);
    })
    // delete single stock
    app.delete("/delete-stock/:id",async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await productCollection.deleteOne(query);
        res.send(result);
    })
    //get filter product by email address
    app.get("/filter-products",verifyToken,async(req,res)=>{
        const decodedEmail = req.decoded.email;
        const email = req.query.email;
        if(decodedEmail===email){
        const query = {email};
        const cursor = productCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
    }else{
        res.status(403).send({messege:"forbidden access"})
    }
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