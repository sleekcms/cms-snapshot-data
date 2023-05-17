import { getPayload, getMockPayload } from '../src';
import * as jsonfile from 'jsonfile';

describe('getPayload', () => {
    test('should return an object', () => {
        let snapshot: any = jsonfile.readFileSync('./test/snapshots/snapshot-95-r-13.json');
        console.log('snapshot', snapshot.recs.length);
        const label = 'test';
        const payload = getPayload(snapshot, label);
        expect(payload).toEqual({});
    });
});
