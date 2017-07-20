#!/usr/bin/env node

/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

'use strict';

const Coa = require('coa');
const Chalk = require('chalk');
const Path = require('path');
const Fs = require('fs');
const Package = require('../package.json');
const Spritify = require('../index.js');

const cwd = process.cwd();

const white = Chalk.white;

const errStr = (str) => {

    return Chalk.bgRed.white('ERROR') + ' ' + Chalk.red(str);  
};

Coa.Cmd()
    .helpful()
    .name(Package.name)
    .title(Package.description)
    .opt()
        .name('version').title('Version')
        .short('v').long('version')
        .only()
        .flag()
        .act(function () {
            process.stdout.write(Package.version + '\n');
            return '';
        })
        .end()
    .opt()
        .name('config').title('JSON Config file path (It should be relative path)')
        .only()
        .short('c').long('config')
        .val(function (val) {
            if (val) {
                try {
                    const config = require(Path.join(cwd, val));
                    return config;
                } catch(err) {
                   return this.reject(errStr('Option \'' + white('--config') + '\' throws an error: ' + err.message)); 
                }
            }
            return this.reject(errStr('Option \'' + white('--config') + '\' must have a value.'));
        })
        .end()
    .opt()
        .name('src').title('Source directory of the images for the sprite image (It should be relative path).')
        .short('s').long('src')
        .val(function (val) {
            if (val) {
                if (Fs.existsSync(Path.join(cwd, val))) {
                    return val;
                }
                return this.reject(errStr('Can\'t find src directory at ' + white(val) + ', please make sure to use correct relative path.')); 
            }
            return this.reject(errStr('Option \'' + white('--src') + '\' must have a value.'));
        })
        .end()
    .opt()
        .name('dest').title('Destination file path of the sprite image (It should be relative path).')
        .short('d').long('dest')
        .val(function (val) {
            return val || this.reject(errStr('Option \'' + white('--dest') + '\' must have a value.'));
        })
        .end()
    .opt()
        .name('layout').title('layout of the sprite image e.g: \'' + white('top-down') + '\', \'' + white('left-right') + '\'.')
        .short('l').long('layout')
        .val(function (val) {
            return val || this.reject(errStr('Option \'' + white('--layout') + '\' must have a value.'));
        })
        .end()
    .opt()
        .name('svg').title('Flag to build svg sprite image')
        .short('svg').long('svg')
        .flag()
        .end()
.act(function (opts, args) {

    let self = this;
    let config = {
        debug: true,
        sprites: [{
            svg: opts.svg,
            layout: opts.layout,
            src: '',
            dest: ''
        }]
    };

    if (!Object.keys(opts).length) {
        return self.usage();
    }

    if (opts.config) {
        config = opts.config;
    } else {
        if (opts.src) {
            config.sprites[0].src = opts.src;
        } else {
            return self.reject(errStr('Please add option \'--src\'.'));
        }
        if (opts.dest) {
            config.sprites[0].dest = opts.dest;
        }else {
            return  self.reject(errStr('Please add option \'--dest\'.'));
        }
    }

    Spritify.build(config, (err)=> {

        if (err) {
            return self.reject(errStr(err));
        }
    });

}).run();
