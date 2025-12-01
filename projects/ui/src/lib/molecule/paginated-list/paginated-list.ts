import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stack } from '../../atoms/stack/stack';
import { Cluster } from '../../atoms/cluster/cluster';
import { Button } from '../../atoms/button/button';
import { Box } from '../../atoms/box/box';
import { Grid } from '../../atoms/grid/grid';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PageChangeEvent {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'pc-paginated-list',
  imports: [CommonModule, Stack, Cluster, Button, Box, Grid],
  templateUrl: './paginated-list.html',
  styleUrl: './paginated-list.css',
  host: { 'data-pc-component': 'paginated-list' }
})
export class PaginatedList<T> {
  /** The items to display in the current page */
  @Input() items: T[] = [];

  /** Current page number (1-indexed) */
  @Input() currentPage = 1;

  /** Number of items per page */
  @Input() pageSize = 10;

  /** Total number of items (for server-side pagination) */
  @Input() totalItems = 0;

  /** Available page size options */
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];

  /** Whether to show the page size selector */
  @Input() showPageSizeSelector = true;

  /** Whether to show page numbers between prev/next */
  @Input() showPageNumbers = true;

  /** Maximum number of page buttons to show */
  @Input() maxPageButtons = 5;

  /** Loading state */
  @Input() loading = false;

  /** Empty state message */
  @Input() emptyMessage = 'No items to display';

  /** Layout mode for list items */
  @Input() layout: 'list' | 'grid' = 'list';

  /** Minimum item width for grid layout */
  @Input() gridMinWidth = '250px';

  /** Template for rendering each item */
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<{ $implicit: T; index: number }>;

  /** Template for custom filter section */
  @ContentChild('filterTemplate') filterTemplate!: TemplateRef<unknown>;

  /** Emitted when the page changes */
  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  /** Emitted when page size changes */
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    const half = Math.floor(this.maxPageButtons / 2);
    let start = Math.max(1, this.currentPage - half);
    const end = Math.min(this.totalPages, start + this.maxPageButtons - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < this.maxPageButtons) {
      start = Math.max(1, end - this.maxPageButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get paginationState(): PaginationState {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages
    };
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit({ page, pageSize: this.pageSize });
    }
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSizeChange.emit(newSize);
    // Reset to first page when changing page size
    this.pageChange.emit({ page: 1, pageSize: newSize });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
