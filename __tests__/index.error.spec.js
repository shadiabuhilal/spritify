/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

describe('Spritify Errors', () => {

    const TestUtil = require.requireActual('./test-util.js');

    const testObj = TestUtil.initTest();

    it('should be an object', () => {

        const Spritify = testObj.Spritify;

        expect(Spritify).toEqual(expect.any(Object));
    });

    describe('.build() // errors', () => {

        it('should return error, when sprite src file does NOT exists', (done) => {

            const Spritify = testObj.Spritify;

            testObj.mockSuccessfull = false;

            const params = {
                css: [
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-z.css',
                        dest: '__tests__/build/css/style-z.css'
                    }
                ],
                sprites: [
                    {
                        padding: 10,
                        layout: 'top-down',
                        src: '__tests__/fixtures/img/icons',
                        dest: '__tests__/build/other/sprite.png',
                        relative: '../images'
                    },
                    {
                        retina: 2,
                        src: 'PATH-DOES-NOT-EXISTS/icons',
                        dest: '__tests__/build/other/sprite@2x.png',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toEqual(expect.any(Object));
                expect(err.message).toMatch(/ENOENT: no such file or directory, scandir .*PATH-DOES-NOT-EXISTS\/icons/);
                done();
            });

        }, TestUtil.longTimeout);

        it('should return error, case of corrupted image', (done) => {

            const Spritify = testObj.Spritify;

            testObj.mockSuccessfull = false;
            testObj.mockSpritesmithErr = new Error('Corrupted image!');

            const params = {
                css: [
                    {
                        src: '__tests__/fixtures/css/style-z.css',
                        dest: '__tests__/build/css/style-z.css'
                    }
                ],
                sprites: [
                    {
                        padding: 10,
                        layout: 'top-down',
                        src: '__tests__/fixtures/img/icons',
                        dest: '__tests__/build/other/sprite.png',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toEqual(expect.any(Object));
                expect(err.message).toEqual(testObj.mockSpritesmithErr.message);
                done();
            });

        }, TestUtil.longTimeout);

        it('should return error, when css src file does NOT exists', (done) => {

            const Spritify = testObj.Spritify;

            testObj.mockSuccessfull = false;

            const params = {
                css: [
                    {
                        optimize: true,
                        src: 'PATH-DOES-NOT-EXISTS/style-a.css',
                        dest: '__tests__/build/css/style-a.css',
                    },
                    {
                        src: '__tests__/fixtures/css/style-z.css',
                        dest: '__tests__/build/css/style-z.css'
                    }
                ],
                sprites: [
                    {
                        padding: 10,
                        layout: 'top-down',
                        src: '__tests__/fixtures/img/icons',
                        dest: '__tests__/build/other/sprite.png',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toEqual(expect.any(Object));
                expect(err.message).toMatch(/ENOENT: no such file or directory, open .*PATH-DOES-NOT-EXISTS\/style-a\.css/);
                done();
            });

        }, TestUtil.longTimeout);

        it('should return error, when failed to exec mkdirp', (done) => {

            const Spritify = testObj.Spritify;

            testObj.mockSuccessfull = false;
            testObj.mockMkdirpErr = new Error('Can\'t exec mkdirp');

            const params = {
                css: [
                    {
                        src: '__tests__/fixtures/css/style-z.css',
                        dest: '__tests__/build/css/style-z.css'
                    }
                ],
                sprites: [
                    {
                        padding: 10,
                        layout: 'top-down',
                        src: '__tests__/fixtures/img/icons',
                        dest: '__tests__/build/other/sprite.png',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toEqual(expect.any(Object));
                expect(err.message).toMatch(testObj.mockMkdirpErr.message);
                done();
            });

        }, TestUtil.longTimeout);

        it('should return error, Can\'t write file', (done) => {

            const Spritify = testObj.Spritify;

            testObj.mockSuccessfull = false;
            testObj.mockWriteFileErr = new Error('Can\'t exec writeFile');

            const params = {
                debug: true,
                css: [
                    {
                        src: '__tests__/fixtures/css/style-z.css',
                        dest: '__tests__/build/css/style-z.css'
                    }
                ],
                sprites: [
                    {
                        padding: 10,
                        layout: 'top-down',
                        src: '__tests__/fixtures/img/icons',
                        dest: '__tests__/build/other/sprite.png',
                        relative: '../images'
                    }
                ]
            };            

            Spritify.build(params, (err) => {

                expect(err).toEqual(expect.any(Object));
                expect(err.message).toEqual(testObj.mockWriteFileErr.message);
                done();
            });

        }, TestUtil.longTimeout);

    });

});
