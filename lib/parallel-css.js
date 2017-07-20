/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */



/** @ignore */
const Async = require('async');
const Css = require('css');
const Files = require('./files.js');
const ProcessCss = require('./process-css.js');
const Util = require('./util.js');

/**
 * This function will update css file with the new sprite images details
 * @memberof ParallelCss
 * @param {Array} cssList is array of css info objects
 * @param {Array} sprites is array of sprite objects
 * @param {Function} callback function
 * @returns {void}
 */
const updateCss = (cssList, sprites, callback) => {

    const parallelCss = [];

    for (const cssInfo of cssList) {

        parallelCss.push((cb) => {

            // read css file content
            Files.readFile(cssInfo.src, 'Reading file:', (err, cssContent) => {

                if (err) {
                    // call parallel callback
                    cb(err);
                    return;
                }

                // parse css content
                const parsedCss = Css.parse(cssContent);

                // check if css file is compressed or not
                cssInfo.isCompressed = !Util.hasNewLine(cssContent);

                const processParsedCss = () => {

                    // update css rules
                    parsedCss.stylesheet.rules = ProcessCss.updateCssRules(parsedCss.stylesheet.rules, sprites, cssInfo);

                    // stringify the parse css content
                    const stringifiedCss = Css.stringify(parsedCss, {
                        compress: cssInfo.isCompressed
                    });

                    // save the updated css file to destination Path, and forward the parallel callback
                    Files.writeFile(cssInfo.dest, stringifiedCss, 'Saving sprite css at:', cb);
                };

                if (Util.canDebug()) {
                    // write parse css content into json in debug mode
                    Files.writeFile(
                        cssInfo.dest + '.json',
                        Util.readableJsonString(parsedCss),
                        'Saving parsed css json at:', (err) => {

                            if (err) {
                                // call parallel callback
                                cb(err);
                                return;
                            }

                            processParsedCss();
                        });
                    return;
                }

                processParsedCss();
            });

        });
    }

    Async.parallel(parallelCss, callback);
};

/** @namespace ParallelCss */
module.exports = {
    updateCss
};
