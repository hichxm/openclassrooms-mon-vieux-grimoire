const Book = require('./../Schemas/Book')
const path = require('path');
const {imagesBookPath, publicImagesBookURL, publicPath} = require("../helper");
const sharp = require('sharp');
const fs = require("node:fs");

const deleteImage = (path) => {
    try {
        if(fs.existsSync(path)) {
            fs.unlinkSync(path)
        }
    } catch (error) {
        return false;
    }

    return true;
}

const convertImageToJPEG = async (imagePath) => {
    const basenameImagePath = path.basename(imagePath)
    const extensionImagePath = path.extname(imagePath)

    const publicImagePath = imagesBookPath(
        basenameImagePath.replace(extensionImagePath, '.webp')
    );

    await sharp(imagePath)
        .withExif({})
        .webp()
        .toFile(publicImagePath)

    return path.basename(publicImagePath);
}

const calculateAverageRating = (ratings) => {
    return (ratings.reduce((acc, rating) => acc + rating.grade, 0) / ratings.length)
        .toFixed(1)
}

exports.getBooks = async (req, res) => {
    const books = await Book.find()

    return res.status(200).json(books)
}

exports.getBook = async (req, res) => {
    const book = await Book.findById(req.params.id)

    if(!book) {
        return res.status(404).json({error: 'Book not found'})
    }

    return res.status(200).json(book)
}

exports.getBooksBestRating = async (req, res) => {
    const books = await Book.find().sort({averageRating: 'desc'}).limit(3)

    return res.status(200).json(books)
}

exports.storeBook = async (req, res) => {
    // Store image and convert to JPEG
    const imagePath = await convertImageToJPEG(req.file.path)

    const reqBookParsed = JSON.parse(req.body.book)

    const book = new Book({
        userId: req.user.userId,
        title: reqBookParsed.title,
        author: reqBookParsed.author,
        imageLocalPath: imagePath,
        year: reqBookParsed.year,
        genre: reqBookParsed.genre,
        ratings: reqBookParsed.ratings,
        averageRating: reqBookParsed.averageRating,
    })

    try {
        await book.save()

        res.status(201).json({message: 'Book created successfully'})
    } catch (error) {
        console.error(error)

        res.status(400).json(error)
    }
}

exports.updateBook = async (req, res) => {
    const book = await Book.findOne({
        _id: req.params.id,
        userId: req.user.userId,
    })

    if(!book) {
        return res.status(403).json({message: 'Unauthorized'})
    }

    let imageLocalPath = book.imageLocalPath
    let reqBookParsed = {}

    if(req.file) {
        imageLocalPath = await convertImageToJPEG(req.file.path)

        reqBookParsed = JSON.parse(req.body.book)
    } else {
        reqBookParsed = req.body
    }

    const oldImageLocalPath = book.imageLocalPath

    book.title = reqBookParsed.title
    book.author = reqBookParsed.author
    book.imageLocalPath = imageLocalPath
    book.year = reqBookParsed.year
    book.genre = reqBookParsed.genre

    try {
        await book.save()

        res.status(201).json({message: 'Book updated successfully'})

        // Delete old image
        if(book.imageLocalPath !== oldImageLocalPath) {
            deleteImage(publicPath('images/', 'books/', oldImageLocalPath))
        }
    } catch (error) {
        console.error(error)

        res.status(400).json({message: 'Failed to update book'})

        if(book.imageLocalPath !== oldImageLocalPath) {
            deleteImage(publicPath('images/', 'books/', oldImageLocalPath))
        }
    }
}

exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId,
        })

        if(!book) {
            return res.status(403).json({message: 'Unauthorized'})
        }

        res.status(200).json({message: 'Book deleted successfully'})

        deleteImage(publicPath('images/', 'books/', book.imageLocalPath))
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.updateBookRating = async (req, res) => {
    const book = await Book.findById(req.params.id)

    if(!book) {
        return res.status(404).json({error: 'Book not found'})
    }

    const newRating = book.ratings.filter(rating => rating.userId !== req.user.userId)

    newRating.push({
        userId: req.user.userId,
        grade: req.body.rating
    })

    book.ratings = newRating
    book.averageRating = calculateAverageRating(newRating)

    try {
        await book.save()

        res.status(200).json(book)
    } catch (error) {
        res.status(400).json(error)
    }
}