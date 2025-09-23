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

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})
