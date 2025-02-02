const books = require("./books");
const user = require("./user");
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/**
 * APIS
 */
app.use("/api/books", books);
app.use("/api/auth", user);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.all("*", function (req, res) {
  console.warn("Trying to access unknown url : ", req.url);
  res.sendStatus(404);
});

module.exports = app;