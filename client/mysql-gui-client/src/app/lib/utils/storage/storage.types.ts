import { AppTheme } from '@lib/services/theme';

type StorageObjectMap = {
    appSession: {
        user: string;
        token: string;
    };
    appTheme: AppTheme;
};

export type StorageObjectType = 'appSession' | 'appTheme';

export type StorageObjectData<T extends StorageObjectType> = {
    type: T;
    data: StorageObjectMap[T];
};

export interface newTabData {
    dbName: string;
    tableName: string;
}

export interface openAIEvent {
    openAIEnabled: boolean;
}

export interface QueryHistoryRecord {
    id: string;
    query: string;
    database: string;
    timestamp: string;
    status: 'success' | 'error';
    durationMs: number;
    source: 'manual' | 'ai';
    prompt?: string;
}

export interface TableInfo {
    db_name: string;
    table_name: string;
    columns: any[];
    indexes: any[];
    foreign_keys: any[];
    triggers: any[];
}

export interface IndTableInfo {
    table_name: string;
    columns: any[];
    indexes: any[];
    foreign_keys: any[];
    triggers: any[];
}

export interface MultipleTablesInfo {
    tables: IndTableInfo[];
}

interface Column {
    column_name: string;
}

interface Table {
    name: string;
    columns: Column[];
}

export interface DbMeta {
    name: string;
    sizeOnDisk: string;
    tables: Table[];
}

export interface OpenAIPromptResponse {
    query: string;
}

export interface OpenAIPrompt {
    dbMeta: DbMeta[];
    databaseName: string;
    prompt: string;
}
