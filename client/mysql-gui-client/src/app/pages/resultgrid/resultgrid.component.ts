import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BackendService } from '@lib/services';
import { TruncatePipe } from '@lib/providers/truncate.pipe';
import { FilterRowsPipe } from '@lib/providers/filter-rows.pipe';

@Component({
    selector: 'app-resultgrid',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TruncatePipe, FilterRowsPipe],
    templateUrl: './resultgrid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultGridComponent {
    @Input() triggerQuery: string = '';
    @Input() executeTriggered: boolean = false;
    @Input() dbName: string = '';
    @Input() tabId: string = '';
    @Input() demoRows: any[] | null = null;

    tabsData = new Map<string, any>();
    headers: string[] = [];
    rows: any[] = [];
    isLoading: boolean = false;
    copiedCell: string | null = null;
    errorMessage: string | null = null;
    copiedPosition = { left: 0, top: 0 };
    currentPage: number = 1;
    pageSize: number = 10;
    totalRows: number = 0;
    totalPages: number = 1;
    filterText: string = '';
    appliedFilter: string = '';
    private filterTimer?: ReturnType<typeof setTimeout>;

    constructor(private dbService: BackendService, private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['demoRows'] && this.demoRows) {
            this.setData(this.demoRows);
            this.totalRows = this.demoRows.length;
            this.totalPages = 1;
            this.tabsData.set(this.tabId || 'frontend-ux-demo', [{ rows: this.demoRows, totalRows: this.demoRows.length }]);
            return;
        }
        if (changes['triggerQuery'] || changes['dbName'] || changes['tabId']) {
            if (this.dbName != '' && this.triggerQuery != '') {
                this.currentPage = 1;
                this.executeQuery();
            }
        }
    }

    executeQuery() {
        // if (!this.executeTriggered && this.tabsData.has(this.tabId)) {
        //     console.log('Using cached data for tab:', this.tabId);
        //     this.isLoading = true;
        //     const cachedData = this.tabsData.get(this.tabId)[0];
        //     if (cachedData) {
        //         const { rows, totalRows } = cachedData;
        //         this.setData(rows);
        //         this.totalRows = totalRows;
        //         this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        //     }
        //     this.isLoading = false;
        //     this.cdr.markForCheck();
        //     return;
        // }

        this.isLoading = true;
        this.errorMessage = null;
        this.cdr.markForCheck();

        const hasLimitOrOffset = /LIMIT\s+\d+/i.test(this.triggerQuery) || /OFFSET\s+\d+/i.test(this.triggerQuery);
        let effectiveQuery = this.triggerQuery;

        if (!hasLimitOrOffset) {
            const offset = (this.currentPage - 1) * this.pageSize;
            effectiveQuery = `${this.triggerQuery} LIMIT ${this.pageSize} OFFSET ${offset}`;
        }

        this.dbService.executeQuery(this.triggerQuery, this.dbName, this.currentPage, this.pageSize).subscribe(
            (data) => {
                if (data) {
                    const { rows, totalRows } = data;
                    this.tabsData.set(this.tabId, data);
                    this.setData(rows);
                    if (hasLimitOrOffset) {
                        this.currentPage = 1;
                        this.totalPages = 1;
                        this.totalRows = rows.length;
                    } else {
                        this.totalRows = totalRows;
                        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
                    }
                } else {
                    console.error('Error: API returned empty data or unexpected format');
                    this.setData([]); // Clear data if API response is empty
                    this.totalRows = 0;
                    this.totalPages = 1;
                }
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            (error) => {
                this.errorMessage = 'An error occurred while executing the query. Please check and try again.';
                console.error('Error fetching data', error);
                this.isLoading = false;
                this.rows = [];
                this.headers = [];
                this.cdr.markForCheck();
            },
        );
    }

    private setData(data: any[]) {
        if (data && data.length > 0) {
            this.headers = Object.keys(data[0]);
            this.rows = data;
        } else {
            this.headers = [];
            this.rows = [];
        }
        this.cdr.markForCheck();
    }

    copyToClipboard(text: string, rowIndex: number, header: string, event: MouseEvent) {
        navigator.clipboard.writeText(text).then(
            () => {
                this.copiedCell = `${rowIndex}-${header}`;
                this.copiedPosition = { left: event.pageX, top: event.pageY - 30 };
                this.cdr.markForCheck();
                setTimeout(() => {
                    this.copiedCell = null;
                    this.cdr.markForCheck();
                }, 1000);
                console.log('Copied to clipboard:', text);
            },
            (err) => {
                console.error('Failed to copy:', err);
            },
        );
    }

    changePage(newPage: number) {
        if (newPage > 0 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.executeQuery();
        }
    }

    updateFilter() {
        clearTimeout(this.filterTimer);
        this.filterTimer = setTimeout(() => {
            this.appliedFilter = this.filterText;
            this.cdr.markForCheck();
        }, 300);
    }

    clearFilter() {
        clearTimeout(this.filterTimer);
        this.filterText = '';
        this.appliedFilter = '';
        this.cdr.markForCheck();
    }

    // Export the currently displayed rows as a JSON file (client-side only).
    exportJSON() {
        if (this.rows.length === 0) return;
        const content = JSON.stringify(this.rows, null, 2);
        this.downloadFile(content, 'application/json', 'json');
    }

    // Export the currently displayed rows as a CSV file (client-side only).
    exportCSV() {
        if (this.rows.length === 0) return;
        const headerLine = this.headers.map((h) => this.escapeCsv(h)).join(',');
        const rowLines = this.rows.map((row) => this.headers.map((h) => this.escapeCsv(row[h])).join(','));
        const content = [headerLine, ...rowLines].join('\r\n');
        this.downloadFile(content, 'text/csv', 'csv');
    }

    // Quote a CSV value and escape embedded quotes so commas/quotes/newlines
    // in the data cannot break the CSV structure (proposal Risk #4).
    private escapeCsv(value: any): string {
        if (value === null || value === undefined) return '';
        const str = String(value);
        return `"${str.replace(/"/g, '""')}"`;
    }

    // Turn a string into a Blob and trigger a native browser download.
    private downloadFile(content: string, mimeType: string, extension: string) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `query-result-${Date.now()}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
