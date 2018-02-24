import Base from '../Base';
import axios from 'axios';
import * as moxios from 'moxios';

describe('Base', () => {
    beforeEach(() => {
        moxios.install();
    });
    afterEach(() => {
        moxios.uninstall();
    });

    it('should send request.', (done) => {
        const requester = jest.fn(() => {
            return axios.get('/some/api');
        });

        moxios.withMock(async () => {
            const base = new Base(requester);
            base.send({}, {});

            moxios.wait(async () => {
                const request = moxios.requests.mostRecent();
                await request.respondWith({status: 200, response: {success: true}});

                expect(requester.mock.calls.length).toBe(1);
                expect(requester.mock.calls[0].length).toBe(2);
                done();
            });
        });
    });

    it('should not effect the stream if the server response error.', (done) => {
        const requester = jest.fn(() => {
            return axios.get('/some/api');
        });

        moxios.withMock(async () => {
            const base = new Base(requester);
            base.send({}, {});

            moxios.wait(async () => {
                const request = moxios.requests.mostRecent();
                await request.respondWith({status: 500, response: {success: true}});

                expect(requester.mock.calls.length).toBe(1);
                expect(requester.mock.calls[0].length).toBe(2);
                done();
            });
        });
    });
});
