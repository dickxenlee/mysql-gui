import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryPanelComponent } from './history-panel.component';
import { QueryHistoryRecord } from '@lib/utils/storage/storage.types';

describe('HistoryPanelComponent', () => {
    let component: HistoryPanelComponent;
    let fixture: ComponentFixture<HistoryPanelComponent>;

    const older: QueryHistoryRecord = {
        id: '1',
        query: 'SELECT * FROM users;',
        database: 'app',
        timestamp: '2026-06-10T10:00:00.000Z',
        status: 'success',
        durationMs: 22,
        source: 'manual',
    };
    const newer: QueryHistoryRecord = {
        id: '2',
        query: 'SELECT * FROM orders;',
        database: 'app',
        timestamp: '2026-06-11T10:00:00.000Z',
        status: 'error',
        durationMs: 40,
        source: 'ai',
        prompt: 'Show orders',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [HistoryPanelComponent] }).compileComponents();
        fixture = TestBed.createComponent(HistoryPanelComponent);
        component = fixture.componentInstance;
    });

    it('sorts records newest first without changing the input', () => {
        component.records = [older, newer];

        expect(component.sortedRecords).toEqual([newer, older]);
        expect(component.records).toEqual([older, newer]);
    });

    it('toggles the collapsed state', () => {
        expect(component.collapsed).toBeFalse();
        component.toggleCollapsed();
        expect(component.collapsed).toBeTrue();
    });

    it('emits the selected query for restore', () => {
        spyOn(component.restoreQuery, 'emit');
        component.restore(newer);
        expect(component.restoreQuery.emit).toHaveBeenCalledWith(newer.query);
    });

    it('emits a clear history request', () => {
        spyOn(component.clearHistory, 'emit');
        component.requestClear();
        expect(component.clearHistory.emit).toHaveBeenCalled();
    });
});
