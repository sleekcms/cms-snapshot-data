import { getPayload } from '../src';
import * as jsonfile from 'jsonfile';

describe('getPayload', () => {
    test('should return an object', () => {
        let snapshot: any = jsonfile.readFileSync('./test/snapshots/snapshot-95-r-13.json');
        const label = 'test';
        const payload = getPayload({snapshot, labl: label, env: 'development'});
        expect(typeof payload).toBe('object');
    });
});
