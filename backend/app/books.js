const express = require("express");
const auth = require('./middleware/auth');
const multer = require('./middleware/multer-config');
const Book = require("./models/Book");

const router = express.Router();

/*
 * Récupere tous les livres
 */
router.get("/", async (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
});

/*
 * Récupere un livre via son ID
 */
router.get("/:id", async (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
});

/*
 * Ajout d'un livre
 */
router.post("/", auth, multer, async (req, res, next) => {
    const book = JSON.parse(req.body.book);
    console.log('book', book, 'image', req.file)
    const newBook = new Book({
        ...book,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    
    newBook.save()
        .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
});


module.exports = router;
