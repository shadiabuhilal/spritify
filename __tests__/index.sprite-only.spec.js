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

    describe('.build() sprite only', () => {

        it('should be a function', () => {

            const Spritify = testObj.Spritify;

            expect(Spritify.build).toEqual(expect.any(Function));
        });

        it('should build sprites successfully', (done) => {

            const Spritify = testObj.Spritify;
            const Fs = testObj.Fs;

            const params = {
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
                expect(Fs.writeFile.mock.calls).toHaveLength(2);

                const outputFiles = [
                    '__tests__/build/other/sprite.png',
                    '__tests__/build/other/sprite@2x.png'
                ];

                for (const mockCall of Fs.writeFile.mock.calls) {
                    expect(outputFiles).toContain(mockCall[0]);
                }
                
                done();
            });

        });

    });

});
