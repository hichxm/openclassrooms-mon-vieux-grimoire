const Book = require('./../Schemas/Book')
const path = require('path');
const {imagesBookPath} = require("../helper");
const sharp = require('sharp');

const convertImageToJPG = async (imagePath) => {
    const basenameImagePath = path.basename(imagePath)
    const extensionImagePath = path.extname(imagePath)

    const publicImagePath = imagesBookPath(
        basenameImagePath.replace(extensionImagePath, '.jpg')
    );

    await sharp(imagePath)
        .withExif({})
        .jpeg()
        .toFile(publicImagePath)

    return path.basename(publicImagePath);
}

exports.getBooks = async (req, res) => {
    const books = await Book.find()

    return res.status(200).json(books)
}

exports.storeBook = async (req, res) => {
    // Store image
    // console.log(req.file)
    const imagePath = await convertImageToJPG(req.file.path)

    console.log(imagePath)

    // const book = new Book(JSON.parse(req.body.book))

}