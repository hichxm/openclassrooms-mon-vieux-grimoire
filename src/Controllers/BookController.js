const Book = require('./../Schemas/Book')

exports.getBooks = async (req, res) => {
    const books = await Book.find()

    return res.status(200).json(books)
}

exports.storeBook = async (req, res) => {
    // Store image
    console.log(req.file)

    const book = new Book(JSON.parse(req.body.book))

}