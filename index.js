const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const moment = require('moment');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

const mongoURI = 'mongodb+srv://vaibhav:1234@cluster0.24ik1dr.mongodb.net/recrutory?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('connection successfull')
}).catch((err)=> console.log(err));

// get api 
app.get('/msgCheck', (req, res) => {
    res.status(200).send({
        msg: "APIs are working successfully"
    })
});

// post api for Candidate form
app.post('/candidate', async (req, res) => {
    const formData = req.body;
    formData.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db('recrutory'); 
        const collection1 = db.collection('candidate');

        await collection1.insertOne(formData);
        res.status(200).send('OK');
        
        await client.close();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// post api for company form
app.post('/company', async (req, res) => {
    const formData = req.body;
    formData.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db('recrutory');
        const collection3 = db.collection('customer');

        await collection3.insertOne(formData);
        res.status(200).send('OK');
        await client.close();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});