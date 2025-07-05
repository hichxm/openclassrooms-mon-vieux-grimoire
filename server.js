require('dotenv').config()

const router = require('./router');
const {cors} = require("./src/Middlewares/CorsMiddleware");

const express = require('express')
const app = express()
const port = 4000

const mongoose = require('mongoose');

// Connection to MongoDB
mongoose.connect(process.env.MONGODB_CLUSTER)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.static('public'))
app.use(express.json()) // for parsing application/json
app.use(cors)
app.use('/api', router)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})