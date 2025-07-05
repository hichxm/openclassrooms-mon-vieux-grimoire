const Book = require('./../Schemas/Book')
const path = require('path');
const {imagesBookPath} = require("../helper");
const sharp = require('sharp');

const convertImageToJPEG = async (imagePath) => {
    const basenameImagePath = path.basename(imagePath)
    const extensionImagePath = path.extname(imagePath)

    const publicImagePath = imagesBookPath(
        basenameImagePath.replace(extensionImagePath, '.jpeg')
    );

    await sharp(imagePath)
        .withExif({})
        .jpeg()
        .toFile(publicImagePath)

    return path.basename(publicImagePath);
}

const calculateAverageRating = (ratings) => {
    return ratings.reduce((acc, rating) => acc + rating.grade, 0) / ratings.length;
}

exports.getBooks = async (req, res) => {
    const books = await Book.find()

    return res.status(200).json(books)
}

exports.getBook = async (req, res) => {
    const book = await Book.findById(req.params.id)

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
        userId: reqBookParsed.userId,
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

        res.status(400).json({message: 'Failed to create book'})
    }
}

exports.updateBook = async (req, res) => {
    // const userIdFromToken = ;
    const book = await Book.findById(req.params.id)

    let imageLocalPath = book.imageLocalPath;
    let reqBookParsed = {};

    if(req.file) {
        imageLocalPath = await convertImageToJPEG(req.file.path)

        reqBookParsed = req.body.book
    } else {
        reqBookParsed = req.body
    }

    book.title = reqBookParsed.title;
    book.author = reqBookParsed.author;
    book.imageLocalPath = imageLocalPath;
    book.year = reqBookParsed.year;
    book.genre = reqBookParsed.genre;

    try {
        await book.save()

        res.status(201).json({message: 'Book updated successfully'})
    } catch (error) {
        console.error(error)

        res.status(400).json({message: 'Failed to update book'})
    }
}