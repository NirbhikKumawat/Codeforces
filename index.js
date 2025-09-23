const express = require('express');
const cors = require('cors');
const {Pool} = require('pg');
const helmet = require('helmet');
const morgan = require('morgan');
const {urlencoded} = require("express");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT||5432,
    max:20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
app.use(urlencoded({ extended: true }));

pool.connect((err,client,release)=>{
    if(err){
        console.error('Error acquiring client');
    }else{
        console.log('Connected to PostgreSQL database');
    }
    release();
})

app.get('/user/:username',async (req, res) => {
    try{
        const username = req.params.username;
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${req.params.username}`);
        const data = await response.json();
        res.json(data);
    }catch(err){
        console.error('Error fetching user');
        res.status(500).send('Error fetching the user');
    }
})

app.get('/users/:handle',async (req, res) => {
    try{
        const handle = req.params.handle;
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${req.params.handle}`);
        const apiResponse = await response.json();
        const db_update = await pool.query(`UPDATE handles SET currentrating=$1,maxrating=$2 WHERE handlename=$3`,[apiResponse.result[0].rating,apiResponse.result[0].maxRating,apiResponse.result[0].handle]);
        const db_response = await pool.query(`SELECT * FROM  handles WHERE handlename=$1`, [handle]);
        console.log(db_update);
        res.json({
            success:true,
            data: db_response.rows,
            data2: apiResponse,
        })
    }catch(err){
        console.error('Error fetching user');
    }
})
app.listen(port, () => {
    console.log(`Listening on ${port}`);
})

