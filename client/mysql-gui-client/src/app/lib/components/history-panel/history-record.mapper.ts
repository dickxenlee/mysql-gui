import { QueryHistoryRecord } from '@lib/utils/storage/storage.types';

export function mapHistoryRecord(record: any): QueryHistoryRecord {
    const executionTime = Number(record?.executionTimeMs);

    return {
        id: String(record?.id ?? `${record?.timestamp ?? 'unknown'}-${record?.query ?? ''}`),
        query: String(record?.query ?? ''),
        database: String(record?.database ?? 'Unknown database'),
        timestamp: String(record?.timestamp ?? ''),
        status: record?.status === 'error' ? 'error' : 'success',
        durationMs: Number.isFinite(executionTime) ? executionTime : 0,
        source: record?.source === 'ai' ? 'ai' : 'manual',
        ...(record?.prompt ? { prompt: String(record.prompt) } : {}),
    };
}
