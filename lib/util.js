/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */



/** @ignore */
const Async = require('async');
const Fs = require('fs');
const Chalk = require('chalk');
const JsonStringifySafe = require('json-stringify-safe');

// regex for matching spritify ignore statment in the css
const ignoreRegex = /spritify\s*:\s*ignore/;
// regex for matching newlines
const newLineRegex = /\r?\n/;
// settings object
let settings;
// current working directory of the Node.js process 
const cwd = process.cwd();
// regex for matching background-image url
const cssImageUrlRegex = /.*url\s{0,}\([\s'"]{0,}([./]{0,})(.+[^\s'"])[\s'"]{0,}\)/;
// regex for matching image data
const imageDataRegex = /^data:/;
// array of image spec properties
const imageSpecKeys = ['width', 'height', 'x', 'y'];
// regex for matching dir prefix ../ and ./
const replaceDirPrefixRegex = /(\.\.\/|\.\/)/g;

/**
 * This function create image sprite(s) from images,
 * and update css file(s) with new image sprite(s) details.
 * @memberof Util
 * @param {Object} params object
 * @param {Function} callback function
 * @returns {void}
 */
const setBuildOptions = (params) => {

    settings = {
        debug: params.debug,
        showIgnoredRules: params.showIgnoredRules
    };
};

/**
 * This function to encode string
 * @private
 * @param {String} content as string
 * @param {String} encoding string e.g: 'utf8', 'base64'
 * @return {String} encoded string
 */
const encodeString = (content, encoding) => {

    return Buffer.from(content).toString(encoding).replace(/\n\r/g, '');
};

/**
 * This function to get svg image as inline base64 data string
 * @private
 * @memberof Util
 * @param {String} content ofthe svg as string
 * @return {String} inline data for svg image as base64 string
 */
const getSvgInline = (content) => {

    // return svg image data as base64 string
    return 'data:image/svg+xml;base64,' + encodeString(content, 'base64');
};

/**
 * This function to return image content as inline base64 data string
 * @memberof Util
 * @param {String} content of the image as string
 * @param {Boolean} isSvg is image flag if it's svg image
 * @return {String} inline data for image as base64 string
 */
const getInline = (content, isSvg) => {

    if (isSvg) {
        // return svg image data as base64 string
        return getSvgInline(content);
    }

    // return png image data as base64 string
    return 'data:image/png;base64,' + encodeString(content, 'base64');
};

/**
 * This function to initialize sprite result object
 * @memberof Util
 * @return {Object} sprite result object
 */
const initSpriteResultObj = () => {

    const result = {
        coordinates: {},
        properties: {
            inline: undefined,
            width: undefined,
            height: undefined
        },
        inline: undefined,
        image: undefined
    };

    return result;
};

/**
 * This function to read content in parallel of sprite images files,
 * and set inline content to the coordinates object by refrance
 * @memberof Util
 * @param {Array} spriteFiles is array of images files paths for the sprite
 * @param {Object} coordinates of the image details object, call by refrance
 * @param {Boolean} isSvg is image flag if it's svg image
 * @param {Function} callback function
 * @returns {void}
 */
const setInlineImages = (spriteFiles, coordinates, isSvg, callback) => {

    const parallelInlineImages = [];

    for (const filePath of spriteFiles) {

        parallelInlineImages.push((cb) => {
            let content;
            try {
                content = Fs.readFileSync(filePath);
            }
            catch (err) {
                /* istanbul ignore next */
                cb(err);
                /* istanbul ignore next */
                return;
            }
            // normalize coordinates object
            coordinates[filePath] = coordinates[filePath] || {};
            // set inline base64 image data to coordinates object using image path as key
            coordinates[filePath].inline = getInline(content, isSvg);

            if (isSvg) {
                // set svg raw content
                coordinates[filePath]._svgContent = content;
            }

            // call parallel callback
            cb();
        });
    }

    // process sprite files in parallel
    Async.parallel(parallelInlineImages, (err) => {

        callback(err);
    });
};

/**
 * This function to show ignored rules message in the console
 * @memberof Util
 * @param {Array} selectors is the array of css selectors
 * @param {String} cssSrc is the source path for the css file
 * @param {Number} line is the line number for the css rule 
 * @param {Number} column is the column number for the css rule 
 * @returns {void}
 */
const showIgnoredRulesMsg = (selectors, cssSrc, line, column) => {

    // check settings if it can show message
    if (!settings.showIgnoredRules) {
        return;
    }

    // show message in the console
    console.log(
        Chalk.bgCyan.white('INFO'),
        Chalk.cyan('Ignored css rule(s)'),
        '\'' + selectors.join('\', ') + '\'',
        Chalk.cyan('at css file'),
        cssSrc,
        Chalk.cyan('line'),
        [line, column].join(':')
    );
};

/**
 * This function to show info message in the console
 * @memberof Util
 * @param {String} msg is the message
 * @param {String} filePath is the file path
 * @returns {void}
 */
const showInfoMsg = (msg, filePath) => {

    // check settings if it can show message
    if (!settings.debug) {
        return;
    }

    // show message in the console
    console.log(Chalk.bgCyan.white('INFO'), Chalk.cyan(msg), filePath);
};

/**
 * This function to show error message in the console
 * @memberof Util
 * @param {Object} err is the error object
 * @returns {void}
 */
const showErrorMsg = (err) => {

    // show message in the console
    console.error(Chalk.bgRed.white('ERROR'), Chalk.red(err.stack /* istanbul ignore next */ || err));  
};

/**
 * This function to show can't find image warning message in the console
 * @memberof Util
 * @param {String} imagePath is the image path
 * @param {String} cssSrc is the source path for the css file
 * @param {Number} line is the line number for the css rule 
 * @param {Number} column is the column number for the css rule
 * @param {Array} selectors is the array of css selectors
 * @returns {void}
 */
const showCantFindImageWarn = (imagePath, cssSrc, line, column, selectors) => {

    // show message in the console
    console.warn(
        Chalk.bgYellow.black('WARN'),
        Chalk.yellow('Can\'t find image'),
        imagePath,
        Chalk.yellow('in the sprite image(s) at css file'),
        cssSrc,
        Chalk.yellow('line'),
        [line, column].join(':'),
        Chalk.yellow('css rule(s)'),
        '\'' + selectors.join('\', ') + '\'');
};

/**
 * This function to show unused image warning message in the console
 * @memberof Util
 * @param {String} imagePath is the image path
 * @param {String} dest is the destination path
 * @returns {void}
 */
const showUnusedImageWarn = (imagePath, dest) => {

    // show message in the console
    console.warn(
        Chalk.bgYellow.black('WARN'),
        Chalk.yellow('Unused image'),
        imagePath,
        Chalk.yellow('in sprite file'),
        dest);
};

/**
 * This function to show start message in the console
 * @memberof Util
 * @returns {void}
 */
const startMsg = () => {

    // show message in the console
    console.log(
        Chalk.bgCyan.white('INFO'),
        Chalk.cyan('Spritify - start!')
    );
};

/**
 * This function to show start message in the console
 * @memberof Util
 * @returns {void}
 */
const endMsg = () => {

    // show message in the console
    console.log(
        Chalk.bgCyan.white('INFO'),
        Chalk.cyan('Spritify - end!')
    );
};

/**
 * This function to show unused image warning message in the console
 * @memberof Util
 * @param {String} str is the string value
 * @return {Boolean} return has new line as boolean
 */
const hasNewLine = (str) => {

    return !!str.match(newLineRegex);
};

/**
 * This function to read debug value from the settings object
 * @memberof Util
 * @return {Boolean} return can debug as boolean
 */
const canDebug = () => {

    return settings.debug;
};

/**
 * This function will return image key from the coordinates object
 * @memberof Util
 * @private
 * @param {Object} coordinates is object that contains the coordinates of the images
 * @param {String} imagePath is the image path as key
 * @return {Object} return key of the image
 */
const getImageKeyFromCoordinates = (coordinates, imagePath) => {

    const keys = Object.keys(coordinates);

    for (const key of keys) {
        if (~key.indexOf(imagePath)) {
            return key;
        }
    }
};

/**
 * This function will return image object by normalize image path
 * @memberof Util
 * @param {Array} sprites is array of sprites object
 * @param {String} imagePath is the normalize image path as key
 * @return {Object} return image object by normalize image path 
 */
const getImageObjByPath = (sprites, imagePath) => {

    let imgObj;

    for (const item of sprites) {

        const key = getImageKeyFromCoordinates(item.result.coordinates, imagePath);

        // get image coordinates object by normalize image path in this current sprite item
        const coordinates = item.result.coordinates[key];

        // check image coordinates object exists in this current sprite item
        if (coordinates) {

            // used add flag, so we can tell that this image has been used
            coordinates.used = true;

            // set image object properties
            imgObj = {
                info: item.spriteInfo,
                retina: item.spriteInfo.retina,
                coordinates,
                sprite: {
                    properties: item.result.properties
                }
            };

            // exit this function and retrun the image object
            return imgObj;
        }
    }
};

/**
 * This function check if the image path is relative path or not
 * @memberof Util
 * @param {String} imagePath is the image path
 * @return {Boolean} return is relative path as boolean
 */
const isRelativePath = (imagePath) => {

    imagePath = imagePath.toLowerCase();

    if (~imagePath.indexOf('http://') || ~imagePath.indexOf('https://')) {
        return false;
    }

    return true;
};

/**
 * This function return retena spec for of the image object
 * @memberof Util
 * @param {Object} imageSpec is the image spec object
 * @param {Number} retina is the retina value (e.g: 2) means 2x retina image
 * @return {Object} retina image spec object
 */
const getRetenaSpec = (imageSpec, retina) => {

    const retenaSpec = {};

    for (const key of imageSpecKeys) {
        // check if property exists and it's allowed in the imageSpecKeys array
        if (imageSpec[key] !== undefined && ~imageSpecKeys.indexOf(key)) {
            // calculate retina spec
            retenaSpec[key] = imageSpec[key] / retina;
        }
    }

    return retenaSpec;
};

/**
 * This function return object of normalize image path based on the css file path
 * @memberof Util
 * @param {String} bgImageUrl is the background image url
 * @param {Object} cssInfo is the css details object
 * @return {Object} object of normalize image path
 */
const getNormalizeImagePathObj = (bgImageUrl, cssInfo) => {

    // parse background image url string
    const matchs = bgImageUrl.match(cssImageUrlRegex);
    // get prefix part from the string
    const prefix = matchs && matchs[1];
    // get image path part from the string
    const imagePath = matchs && matchs[2];

    // check if image path is empty
    if (!imagePath) {
        return;
    }

    // ignore if it has data image format in the background image url
    if (imagePath.match(imageDataRegex)) {
        return;
    }

    // build image path string
    const imagePathStr = prefix + imagePath;

    // ignore if it has full image path url in the background image url
    if (!isRelativePath(imagePathStr)) {
        return;
    }

    return {
        prefix,
        imagePath
    };
};

/**
 * This function return readable json string
 * @memberof Util
 * @param {Object} data is the json data object
 * @return {String} readable json string
 */
const readableJsonString = (data) => {

    return JsonStringifySafe(data, null, 4);
};

/**
 * This function return negative value of the number
 * @memberof Util
 * @private
 * @param {Number} value is the number
 * @return {Number} negative value of the number
 */
const getNegativeValue = (value) => {

    value = (value && Math.abs(parseInt(value, 10)) * -1) || 0;
    return value;
};

/**
 * This function will normalize x and y coordinates objects
 * @memberof Util
 * @param {Object} coordinates of objects (call by refrance)
 * @returns {void}
 */
const normalizeCoordinates = (coordinates) => {

    // init normalized coordinates object
    const normalizedCoordinatesObj = {};

    const keys = Object.keys(coordinates);

    for (const key of keys) {

        // remove dir prefix ../ and ./ from the key.
        const newKey = key.replace(replaceDirPrefixRegex, '');

        // init normalized coordinate object
        normalizedCoordinatesObj[newKey] = {};

        const coordinate = coordinates[key];

        const coordinateProperties = Object.keys(coordinate);

        for (const property of coordinateProperties) {

            const value = coordinate[property];

            // copy coordinate value
            normalizedCoordinatesObj[newKey][property] = value;

            if (~['x', 'y'].indexOf(property)) {
                // normalize x and y coordinate with negative value
                normalizedCoordinatesObj[newKey][property] = getNegativeValue(value);
            }
        }

    }

    return normalizedCoordinatesObj;
};

/** @namespace Util */
module.exports = {
    cwd,
    setBuildOptions,
    getInline,
    initSpriteResultObj,
    setInlineImages,
    ignoreRegex,
    showIgnoredRulesMsg,
    showInfoMsg,
    showErrorMsg,
    showCantFindImageWarn,
    showUnusedImageWarn,
    startMsg,
    endMsg,
    hasNewLine,
    canDebug,
    getImageObjByPath,
    isRelativePath,
    getRetenaSpec,
    getNormalizeImagePathObj,
    readableJsonString,
    normalizeCoordinates
};
