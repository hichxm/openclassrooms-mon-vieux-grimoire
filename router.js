const {Router} = require('express');
const AuthController = require("./src/Controllers/AuthController");
const BookController = require("./src/Controllers/BookController");
const {tmpUploadsPath} = require("./src/helper");
const router = Router();
const path = require("node:path");

const multer = require('multer');
const crypto = require("crypto");
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tmpUploadsPath())
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

router.post('/auth/signup', AuthController.createUser)
router.post('/auth/login', AuthController.loginUser)

router.get('/books', BookController.getBooks)
router.post('/books', upload.single('image'), BookController.storeBook)

module.exports = router;