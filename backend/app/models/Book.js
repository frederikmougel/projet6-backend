const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true }, // Identifiant de l'utilisateur créateur
  title: { type: String, required: true }, // Titre du livre
  author: { type: String, required: true }, // Auteur du livre
  imageUrl: { type: String, required: true }, // URL de l'image de couverture
  year: { type: Number, required: true }, // Année de publication
  genre: { type: String, required: true }, // Genre du livre
  ratings: [
    {
      userId: { type: String, required: true }, // Identifiant de l'utilisateur qui note
      grade: { type: Number, required: true, min: 0, max: 5 }, // Note entre 0 et 5
    },
  ],
  averageRating: { type: Number, default: 0 }, // Note moyenne du livre
});

module.exports = mongoose.model('Book', bookSchema);