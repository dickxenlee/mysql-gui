import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QueryHistoryRecord } from '@lib/utils/storage/storage.types';

@Component({
    selector: 'app-history-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './history-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPanelComponent {
    @Input() records: QueryHistoryRecord[] = [];
    @Input() loading = false;
    @Input() error = '';
    @Output() restoreQuery = new EventEmitter<string>();
    @Output() clearHistory = new EventEmitter<void>();

    collapsed = false;

    get sortedRecords(): QueryHistoryRecord[] {
        return [...this.records].sort(
            (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
        );
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
    }

    restore(record: QueryHistoryRecord) {
        this.restoreQuery.emit(record.query);
    }

    requestClear() {
        this.clearHistory.emit();
    }

    trackById(_: number, record: QueryHistoryRecord) {
        return record.id;
    }
}
