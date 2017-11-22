/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

describe('Spritify SVG', () => {

    const TestUtil = require.requireActual('./test-util.js');

    const testObj = TestUtil.initTest();

    it('should be an object', () => {

        const Spritify = testObj.Spritify;

        expect(Spritify).toEqual(expect.any(Object));
    });

    describe('.build() // SVG', () => {

        it('should be a function', () => {

            const Spritify = testObj.Spritify;

            expect(Spritify.build).toEqual(expect.any(Function));
        });

        it('should build SVG sprites and update css successfully', (done) => {

            const Spritify = testObj.Spritify;
            const Fs = testObj.Fs;

            const params = {
                css: [
                    {
                        src: '__tests__/fixtures/css/style-svg-a.css',
                        dest: '__tests__/build/css/style-svg-a.css'
                    },
                    {
                        inline: true,
                        src: '__tests__/fixtures/css/style-svg-inline.css',
                        dest: '__tests__/build/css/style-svg-inline.css',
                    },
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-svg-b.css',
                        dest: '__tests__/build/css/style-svg-b.css'
                    },
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-svg-c.min.css',
                        dest: '__tests__/build/css/style-svg-c.min.css'
                    }
                ],
                sprites: [
                    {
                        svg: true,
                        src: '__tests__/fixtures/img/svg',
                        dest: '__tests__/build/other/sprite.svg',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toBeUndefined();
                expect(Fs.writeFile.mock.calls).toHaveLength(5);

                const outputFiles = [
                    '__tests__/build/other/sprite.svg',
                    '__tests__/build/css/style-svg-a.css',
                    '__tests__/build/css/style-svg-inline.css',
                    '__tests__/build/css/style-svg-b.css',
                    '__tests__/build/css/style-svg-c.min.css'
                ];

                for (const mockCall of Fs.writeFile.mock.calls) {
                    expect(outputFiles).toContain(mockCall[0]);
                }
                
                done();
            });

        }, TestUtil.longTimeout);

        it('should build SVG sprites and update css layout left-right and padding 25 successfully', (done) => {

            const Spritify = testObj.Spritify;
            const Fs = testObj.Fs;

            const params = {
                css: [
                    {
                        src: '__tests__/fixtures/css/style-svg-a.css',
                        dest: '__tests__/build/css/style-svg-a.css'
                    },
                    {
                        inline: true,
                        src: '__tests__/fixtures/css/style-svg-inline.css',
                        dest: '__tests__/build/css/style-svg-inline.css',
                    },
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-svg-b.css',
                        dest: '__tests__/build/css/style-svg-b.css'
                    },
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-svg-c.min.css',
                        dest: '__tests__/build/css/style-svg-c.min.css'
                    }
                ],
                sprites: [
                    {
                        svg: true,
                        layout: 'left-right',
                        padding: 25,
                        src: '__tests__/fixtures/img/svg',
                        dest: '__tests__/build/other/sprite.svg',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toBeUndefined();
                expect(Fs.writeFile.mock.calls).toHaveLength(5);

                const outputFiles = [
                    '__tests__/build/other/sprite.svg',
                    '__tests__/build/css/style-svg-a.css',
                    '__tests__/build/css/style-svg-inline.css',
                    '__tests__/build/css/style-svg-b.css',
                    '__tests__/build/css/style-svg-c.min.css'
                ];

                for (const mockCall of Fs.writeFile.mock.calls) {
                    expect(outputFiles).toContain(mockCall[0]);
                }
                
                done();
            });

        }, TestUtil.longTimeout);

    });

});
