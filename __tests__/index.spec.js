/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

describe('Spritify', () => {

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

        it('should build sprites and update css successfully', (done) => {

            const Spritify = testObj.Spritify;
            const Fs = testObj.Fs;

            const params = {
                css: [
                    {
                        src: '__tests__/fixtures/css/style-a.css',
                        dest: '__tests__/build/css/style-a.css'
                    },
                    {
                        optimize: false,
                        inline: true,
                        src: '__tests__/fixtures/css/style-inline.css',
                        dest: '__tests__/build/css/style-inline.css'
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
                expect(Fs.writeFile.mock.calls).toHaveLength(6);

                '__tests__/build/other/sprite.png',
                '__tests__/build/other/sprite@2x.png',
                '__tests__/build/css/style-a.css'

                const outputFiles = [
                    '__tests__/build/other/sprite.png',
                    '__tests__/build/other/sprite@2x.png',
                    '__tests__/build/css/style-a.css',
                    '__tests__/build/css/style-inline.css',
                    '__tests__/build/css/style-b.css',
                    '__tests__/build/css/style-c.min.css'
                ];

                for (const mockCall of Fs.writeFile.mock.calls) {
                    expect(outputFiles).toContain(mockCall[0]);
                }
                
                done();
            });

        }, TestUtil.longTimeout);

    });

});
