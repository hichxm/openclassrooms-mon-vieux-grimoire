const Book = require('./../Schemas/Book')
const path = require('path');
const {imagesBookPath, publicPath} = require("../helper");
const sharp = require('sharp');
const fs = require("node:fs");

/**
 * Deletes an image file from the specified file path.
 *
 * This function checks if the file exists at the given path and removes it if found.
 * If any error occurs during the delete operation, the function will catch
 * the error and return a boolean value indicating the failure.
 *
 * @param {string} path - The file path of the image to be deleted.
 * @returns {boolean} Returns true if the operation is successful, or false if any error occurs.
 */
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

/**
 * Converts an image file to the WebP format.
 *
 * @async
 * @param {string} imagePath - The file path of the image to be converted.
 * @returns {Promise<string>} A promise that resolves to the filename of the converted WebP image.
 */
const convertImageToWebp = async (imagePath) => {
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

/**
 * Calculates the average rating from an array of rating objects.
 *
 * @param {Array<Object>} ratings - An array of objects representing ratings, where each object contains a `grade` property.
 * @param {number} [fractionDigits=1] - The number of decimal places to round the average to. Defaults to 1.
 * @returns {string} The average rating as a string rounded to the specified number of decimal places.
 */
const calculateAverageRating = (ratings, fractionDigits = 1) => {
    return (ratings.reduce((acc, rating) => acc + rating.grade, 0) / ratings.length)
        .toFixed(fractionDigits)
}

/**
 * Retrieves a list of books from the database.
 */
exports.getBooks = async (req, res) => {
    const books = await Book.find()

    return res.status(200).json(books)
}

/**
 * Retrieves a book based on the param id.
 */
exports.getBook = async (req, res) => {
    const book = await Book.findById(req.params.id)

    if(!book) {
        return res.status(404).json({error: 'Book not found'})
    }

    return res.status(200).json(book)
}

/**
 * Retrieves a list of 3 books sorted by their best ratings.
 */
exports.getBooksBestRating = async (req, res) => {
    const books = await Book.find().sort({averageRating: 'desc'}).limit(3)

    return res.status(200).json(books)
}

/**
 * Stores a book entry in the database and file storage.
 */
exports.storeBook = async (req, res) => {
    const imagePath = await convertImageToWebp(req.file.path)

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

/**
 * Updates an existing book record with new data.
 */
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
        imageLocalPath = await convertImageToWebp(req.file.path)

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

/**
 * Deletes a book by its identifier.
 */
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

/**
 * Updates the rating of a specific book.
 */
exports.updateBookRating = async (req, res) => {
    const book = await Book.findById(req.params.id)

    if(!book) {
        return res.status(404).json({error: 'Book not found'})
    }

    const newRatings = book.ratings.filter(rating => rating.userId !== req.user.userId)

    newRatings.push({
        userId: req.user.userId,
        grade: req.body.rating
    })

    book.ratings = newRatings
    book.averageRating = calculateAverageRating(newRatings)

    try {
        await book.save()

        res.status(200).json(book)
    } catch (error) {
        res.status(400).json(error)
    }
}