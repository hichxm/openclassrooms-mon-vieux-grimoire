const path = require('node:path')

exports.rootPath = (...customPath) => {
    return path.join(__dirname, '..', ...customPath);
}

exports.tmpPath = (...customPath) => {
    return exports.rootPath('tmp', ...customPath);
}

exports.tmpUploadsPath = (...customPath) => {
    return exports.tmpPath('uploads', ...customPath);
}

exports.tmpConvertedUploadsPath = (...customPath) => {
    return exports.tmpPath('uploads-converted', ...customPath);
}

exports.publicPath = (...customPath) => {
    return exports.rootPath('public', ...customPath);
}

exports.imagesPath = (...customPath) => {
    return exports.publicPath('images', ...customPath);
}

exports.imagesBookPath = (...customPath) => {
    return exports.imagesPath('books', ...customPath);
}