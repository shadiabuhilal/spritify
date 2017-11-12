/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

describe('Spritify DEBUG', () => {

    const TestUtil = require.requireActual('./test-util.js');

    const testObj = TestUtil.initTest();

    it('should be an object', () => {

        const Spritify = testObj.Spritify;

        expect(Spritify).toEqual(expect.any(Object));
    });

    describe('.build()', () => {

        it('should be a function', () => {

            const Spritify = testObj.Spritify;

            expect(Spritify.build).toEqual(expect.any(Function));
        });

        it('should build sprites and update css successfully (DEBUG MODE)', (done) => {

            const Spritify = testObj.Spritify;
            const Fs = testObj.Fs;

            const params = {
                debug: true,
                showIgnoredRules: true,
                css: [
                    {
                        src: '__tests__/fixtures/css/style-a.css',
                        dest: '__tests__/build/css/style-a.css'
                    },
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-b.css',
                        dest: '__tests__/build/css/style-b.css'
                    },
                    {
                        optimize: false,
                        src: '__tests__/fixtures/css/style-c.min.css',
                        dest: '__tests__/build/css/style-c.min.css'
                    }
                ],
                sprites: [
                    {
                        padding: 10,
                        layout: 'top-down',
                        src: '__tests__/fixtures/img/icons/',
                        dest: '__tests__/build/other/sprite.png',
                        relative: '../images'
                    },
                    {
                        retina: 2,
                        src: '__tests__/fixtures/img/icons@2x/',
                        dest: '__tests__/build/other/sprite@2x.png',
                        relative: '../images'
                    }
                ]
            };

            Spritify.build(params, (err) => {

                expect(err).toBeUndefined();

                expect(Fs.writeFile.mock.calls).toHaveLength(10);

                const outputFiles = [
                    '__tests__/build/other/sprite.png',
                    '__tests__/build/other/sprite.png.json',
                    '__tests__/build/other/sprite@2x.png',
                    '__tests__/build/other/sprite@2x.png.json',
                    '__tests__/build/css/style-a.css',
                    '__tests__/build/css/style-a.css.json',
                    '__tests__/build/css/style-b.css',
                    '__tests__/build/css/style-b.css.json',
                    '__tests__/build/css/style-c.min.css',
                    '__tests__/build/css/style-c.min.css.json'
                ];

                for (const mockCall of Fs.writeFile.mock.calls) {
                    expect(outputFiles).toContain(mockCall[0]);
                }

                done();
            });

        }, TestUtil.longTimeout);

    });

});
