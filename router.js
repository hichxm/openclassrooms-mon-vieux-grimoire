const multer = require('multer');
const {Router} = require('express');
const AuthController = require("./src/Controllers/AuthController");
const BookController = require("./src/Controllers/BookController");
const router = Router();

const upload = multer({dest: 'uploads/'});

router.post('/auth/signup', AuthController.createUser)
router.post('/auth/login', AuthController.loginUser)

router.get('/books', BookController.getBooks)
router.post('/books', upload.single('image'), BookController.storeBook)

module.exports = router;