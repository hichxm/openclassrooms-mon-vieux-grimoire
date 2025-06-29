const path = require('node:path')
const URL = require('node:url')

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

exports.publicURL = (...customPath) => {
    const mainUrl = new URL.URL(process.env.PUBLIC_URL);

    mainUrl.pathname = customPath
        .map(path => path.trim('/'))
        .join('/');

    return new URL.URL(mainUrl).toString();
}

exports.publicImagesURL = (...customPath) => {
    return exports.publicURL('images', ...customPath);
}

exports.publicImagesBookURL = (...customPath) => {
    return exports.publicImagesURL('books', ...customPath);
}