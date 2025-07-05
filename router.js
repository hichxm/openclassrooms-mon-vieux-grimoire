const {Router} = require('express');
const AuthController = require("./src/Controllers/AuthController");
const BookController = require("./src/Controllers/BookController");
const {tmpUploadsPath} = require("./src/helper");
const router = Router();
const path = require("node:path");

const multer = require('multer');
const crypto = require("crypto");
const fs = require("node:fs");
const AuthenticatedMiddleware = require("./src/Middlewares/AuthenticatedMiddleware");
const CorsMiddleware = require("./src/Middlewares/CorsMiddleware");

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const _tmpUploadsPath = tmpUploadsPath()

        // If the tmp upload path does not exist, create a directory
        if (!fs.existsSync(_tmpUploadsPath))
            fs.mkdirSync(_tmpUploadsPath)

        cb(null, _tmpUploadsPath)
    },
    filename: function (req, file, cb) {
        cb(
            null,
            crypto
                .createHash('sha256')
                .update(
                    Date.now() + file.originalname
                )
                .digest('hex') + path.extname(file.originalname)
        )
    }
})

const upload = multer({storage: multerStorage});

router.use(CorsMiddleware.cors)

router.post('/auth/signup', AuthController.createUser)
router.post('/auth/login', AuthController.loginUser)

router.get('/books', BookController.getBooks)
router.get('/books/bestrating', BookController.getBooksBestRating)
router.get('/books/:id', BookController.getBook)

router.use(['/books', '/books/:id', '/books/:id/rating'], AuthenticatedMiddleware.authenticated)

router.post('/books', upload.single('image'), BookController.storeBook)
router.put('/books/:id', upload.single('image'), BookController.updateBook)
router.delete('/books/:id', BookController.deleteBook)

router.post('/books/:id/rating', BookController.updateBookRating)

module.exports = router;