const express = require("express");
const auth = require('./middleware/auth');
const multer = require('./middleware/multer-config');
const Book = require("./models/Book");
const fs = require('fs');
const path = require('path');

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
    const newBook = new Book({
        ...book,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    
    newBook.save()
        .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
});

/*
 * Modification d'un livre
 */
router.put("/:id", auth, multer, async (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`${path.resolve(__dirname, 'images')}/${filename}`, () => {
                    Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                        .then(() => res.status(200).json({message : 'Livre modifié!'}))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        }
    );
});

/*
 * Suppression d'un livre
 */
router.delete("/:id", auth, multer, async (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`${path.resolve(__dirname, 'images')}/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id})
                        .then(() => res.status(200).json({message : 'Livre supprimé!'}))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        }
    );
});

/**
 * Notation d'un livre
 */
router.post("/:id/rating", auth, async (req, res) => {
    try {
        const { userId, rating } = req.body;
        
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: "La note doit être comprise entre 0 et 5." });
        }

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé." });
        }

        const existingRating = book.ratings.find(r => r.userId === userId);
        if (existingRating) {
            return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
        }

        book.ratings.push({ userId, grade: rating });

        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((acc, r) => acc + r.grade, 0);
        book.averageRating = sumRatings / totalRatings;

        await book.save();

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router;
