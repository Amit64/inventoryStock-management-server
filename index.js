const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3006;
require('dotenv').config();

//middleware
app.use(express.json());
app.use(cors());

async function run(){
    try{

    }finally{
        // await client.close();
    }
}

run().catch(console.dir);