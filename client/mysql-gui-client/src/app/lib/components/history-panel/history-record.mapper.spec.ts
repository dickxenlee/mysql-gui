import { mapHistoryRecord } from './history-record.mapper';

describe('mapHistoryRecord', () => {
    it('maps the backend history shape to the panel contract', () => {
        expect(
            mapHistoryRecord({
                id: 'abc',
                query: 'SELECT 1;',
                database: 'sample_db',
                timestamp: '2026-06-19T10:00:00.000Z',
                status: 'success',
                executionTimeMs: 17,
                source: 'manual',
            }),
        ).toEqual({
            id: 'abc',
            query: 'SELECT 1;',
            database: 'sample_db',
            timestamp: '2026-06-19T10:00:00.000Z',
            status: 'success',
            durationMs: 17,
            source: 'manual',
        });
    });

    it('provides safe UI defaults for missing backend values', () => {
        const result = mapHistoryRecord({ id: 'error', query: 'BAD SQL', status: 'error' });

        expect(result.database).toBe('Unknown database');
        expect(result.durationMs).toBe(0);
        expect(result.source).toBe('manual');
        expect(result.status).toBe('error');
    });
});
