import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Client-side wrapper for the Query History API.
 *
 * Talks to the backend endpoints:
 *   GET    /api/mysql/history  → retrieve all recorded query-history entries
 *   DELETE /api/mysql/history  → clear all recorded entries
 *
 * Consumed by the History Panel component to list and clear query history.
 */
@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    BASE_URL = environment.apiUrl;

    constructor(private _http: HttpClient) {}

    // Retrieve all query-history records (newest first, as ordered by the backend).
    getHistory(): Observable<{ history: any[] }> {
        return this._http.get<{ history: any[] }>(`${this.BASE_URL}/api/mysql/history`);
    }

    // Clear all query-history records.
    clearHistory(): Observable<{ message: string }> {
        return this._http.delete<{ message: string }>(`${this.BASE_URL}/api/mysql/history`);
    }
}
