/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

let Fs;
let Mkdirp;
let Spritesmith;

let Spritify;

let mockReadFileErr;
let mockWriteFileErr;
let mockMkdirpErr;
let mockSpritesmithErr;
let mockSuccessfull;

const reset = () => {

    mockReadFileErr = null;
    mockWriteFileErr = null;
    mockMkdirpErr = null;
    mockSpritesmithErr = null;
    mockSuccessfull = true;

    if (Fs) {
        Fs.mkdir.mockClear();
        Fs.writeFile.mockClear();
    }

    if (Mkdirp) {
        Mkdirp.mockClear();
    }

    if (Spritesmith) {
        Spritesmith.mockClear();
    }
};

 const initTest = () => {

    const Path = require.requireActual('path');

    beforeAll(() => {

        reset();

        // mock modules - start
        jest.mock('fs', () => require.requireActual('fs'));

        jest.mock('mkdirp', () => jest.fn((desDir, callback) => {

            callback(mockMkdirpErr);
        }));

        jest.mock('spritesmith', () => jest.genMockFromModule('spritesmith'));
        // mock modules - end

        Fs = require('fs');

        Mkdirp = require('mkdirp');

        Spritesmith = require('spritesmith');

        // mock functions - start

        /* istanbul ignore next */
        Fs.mkdir = jest.fn(cb => cb());

        // mock console(.log, .warn, .error) if not using debugTest flag
        /* istanbul ignore else */
        if (process.env.debugTest !== 'true') {
            console.log = jest.fn(() => {});
            console.warn = jest.fn(() => {});
            console.error = jest.fn(() => {});        
        }

        Fs.writeFile = jest.fn((desPath, content, callback) => {

            const extname = Path.extname(desPath).toLowerCase();

            if (mockSuccessfull && ~['.css', '.json'].indexOf(extname)) {

                expect({
                    desPath: desPath,
                    content: content
                }).toMatchSnapshot(desPath);
            }

            callback(mockWriteFileErr);
            return;
        });

        Spritesmith.run = jest.fn((options, callback) => {

            if (mockSpritesmithErr) {
                callback(mockSpritesmithErr);
                return;
            }

            require.requireActual('spritesmith').run(options, callback);
        });
        // mock functions - end

        Spritify = require('../index.js');
    });

    beforeEach(() => {

        reset();
    });

    return {
        get Fs () { return Fs; },
        get Spritify () { return Spritify; },
        get mockWriteFileErr () { return mockWriteFileErr; },
        set mockWriteFileErr (err) { mockWriteFileErr = err; },
        get mockMkdirpErr () { return mockMkdirpErr; },
        set mockMkdirpErr (err) { mockMkdirpErr = err; },
        get mockSpritesmithErr () { return mockSpritesmithErr; },
        set mockSpritesmithErr (err) { mockSpritesmithErr = err; },
        set mockSuccessfull (err) { mockSuccessfull = err; }
    }
 };

module.exports = {
    longTimeout: 10000,
    initTest: initTest
};
