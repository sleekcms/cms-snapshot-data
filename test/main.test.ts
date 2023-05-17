import { getPayload, getMockPayload } from '../src';

describe('getPayload', () => {
    test('should return an object', () => {
        const snapshot = {};
        const label = 'test';
        const payload = getPayload(snapshot, label);
        expect(payload).toEqual({});
    });
});
