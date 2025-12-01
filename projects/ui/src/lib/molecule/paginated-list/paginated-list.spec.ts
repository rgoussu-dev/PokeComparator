import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { PaginatedList, PageChangeEvent } from './paginated-list';

@Component({
  standalone: true,
  imports: [PaginatedList],
  template: `
    <pc-paginated-list
      [items]="items"
      [currentPage]="currentPage"
      [pageSize]="pageSize"
      [totalItems]="totalItems"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
    >
      <ng-template #itemTemplate let-item>
        <div class="test-item">{{ item.name }}</div>
      </ng-template>
    </pc-paginated-list>
  `
})
class TestHostComponent {
  items = [{ name: 'Item 1' }, { name: 'Item 2' }];
  currentPage = 1;
  pageSize = 10;
  totalItems = 25;
  lastPageChange: PageChangeEvent | null = null;
  lastPageSize: number | null = null;

  onPageChange(event: PageChangeEvent) {
    this.lastPageChange = event;
  }

  onPageSizeChange(size: number) {
    this.lastPageSize = size;
  }
}

describe('PaginatedList', () => {
  let component: PaginatedList<unknown>;
  let fixture: ComponentFixture<PaginatedList<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatedList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pagination calculations', () => {
    it('should calculate total pages correctly', () => {
      component.totalItems = 25;
      component.pageSize = 10;
      expect(component.totalPages).toBe(3);
    });

    it('should calculate total pages as 1 when no items', () => {
      component.totalItems = 0;
      component.pageSize = 10;
      expect(component.totalPages).toBe(1);
    });

    it('should calculate start and end items correctly', () => {
      component.currentPage = 2;
      component.pageSize = 10;
      component.totalItems = 25;
      expect(component.startItem).toBe(11);
      expect(component.endItem).toBe(20);
    });

    it('should cap end item at total items on last page', () => {
      component.currentPage = 3;
      component.pageSize = 10;
      component.totalItems = 25;
      expect(component.endItem).toBe(25);
    });

    it('should detect has previous page', () => {
      component.currentPage = 1;
      expect(component.hasPreviousPage).toBe(false);
      component.currentPage = 2;
      expect(component.hasPreviousPage).toBe(true);
    });

    it('should detect has next page', () => {
      component.totalItems = 25;
      component.pageSize = 10;
      component.currentPage = 3;
      expect(component.hasNextPage).toBe(false);
      component.currentPage = 2;
      expect(component.hasNextPage).toBe(true);
    });
  });

  describe('visible page numbers', () => {
    beforeEach(() => {
      component.totalItems = 100;
      component.pageSize = 10;
      component.maxPageButtons = 5;
    });

    it('should show correct page numbers at the start', () => {
      component.currentPage = 1;
      expect(component.visiblePageNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should show correct page numbers in the middle', () => {
      component.currentPage = 5;
      expect(component.visiblePageNumbers).toEqual([3, 4, 5, 6, 7]);
    });

    it('should show correct page numbers at the end', () => {
      component.currentPage = 10;
      expect(component.visiblePageNumbers).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe('pagination state', () => {
    it('should return correct pagination state', () => {
      component.currentPage = 2;
      component.pageSize = 10;
      component.totalItems = 25;
      
      const state = component.paginationState;
      expect(state.currentPage).toBe(2);
      expect(state.pageSize).toBe(10);
      expect(state.totalItems).toBe(25);
      expect(state.totalPages).toBe(3);
    });
  });
});

describe('PaginatedList with host', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should render items using template', () => {
    const items = hostFixture.nativeElement.querySelectorAll('.test-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('Item 1');
  });

  it('should display pagination info', () => {
    const paginationInfo = hostFixture.nativeElement.querySelector('.pagination-info');
    expect(paginationInfo).toBeTruthy();
    expect(paginationInfo.textContent).toContain('1');
    expect(paginationInfo.textContent).toContain('25');
  });

  it('should show page size selector when enabled', () => {
    const pageSelect = hostFixture.nativeElement.querySelector('.page-size-select');
    expect(pageSelect).toBeTruthy();
  });
});
