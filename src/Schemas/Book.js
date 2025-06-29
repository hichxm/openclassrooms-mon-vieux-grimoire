const mongoose = require('mongoose');
const {publicImagesBookURL} = require("../helper");

const bookSchema = mongoose.Schema({
    userId: {type: String, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    imageLocalPath: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, required: true},
    ratings: [
        {
            userId: {type: String, required: true},
            grade: {type: Number, required: true}
        }
    ],
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

bookSchema.virtual('averageRating').get(function () {
    return this.ratings
        .reduce((acc, rating) => acc + rating.grade, 0) / this.ratings.length || 0;
})

bookSchema.virtual('imageUrl').get(function () {
    return publicImagesBookURL(this.imageLocalPath)
})

module.exports = mongoose.model('Book', bookSchema);