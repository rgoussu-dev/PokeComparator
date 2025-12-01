import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { PaginatedList } from '../lib/molecule/paginated-list/paginated-list';
import { Searchbar } from '../lib/molecule/searchbar/searchbar';
import { Box } from '../lib/atoms/box/box';

interface MockItem {
  id: number;
  name: string;
  description: string;
}

// Helper component for rendering items in stories
@Component({
  selector: 'story-item-card',
  standalone: true,
  imports: [Box],
  template: `
    <pc-box padding="s0" [borderWidth]="'1px'">
      <strong>{{ item.name }}</strong>
      <p style="margin: 0; font-size: var(--s-1); color: #666;">{{ item.description }}</p>
    </pc-box>
  `
})
class StoryItemCard {
  @Input() item!: MockItem;
}

// Generate mock data
const generateMockItems = (count: number): MockItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`
  }));
};

const meta: Meta<PaginatedList<MockItem>> = {
  title: 'Molecule/PaginatedList',
  component: PaginatedList,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [StoryItemCard, Searchbar, Box]
    })
  ],
  argTypes: {
    layout: {
      control: 'select',
      options: ['list', 'grid']
    },
    pageChange: { action: 'pageChange' },
    pageSizeChange: { action: 'pageSizeChange' }
  }
};

export default meta;
type Story = StoryObj<PaginatedList<MockItem>>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: generateMockItems(10),
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems"
        [showPageSizeSelector]="showPageSizeSelector"
        [showPageNumbers]="showPageNumbers"
        [layout]="layout"
        (pageChange)="pageChange($event)"
        (pageSizeChange)="pageSizeChange($event)"
      >
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 50,
    showPageSizeSelector: true,
    showPageNumbers: true,
    layout: 'list'
  }
};

export const GridLayout: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: generateMockItems(12),
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems"
        [layout]="layout"
        [gridMinWidth]="gridMinWidth"
        (pageChange)="pageChange($event)"
      >
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    currentPage: 1,
    pageSize: 12,
    totalItems: 48,
    layout: 'grid',
    gridMinWidth: '200px'
  }
};

export const WithFilters: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: generateMockItems(10),
      searchValue: '',
      onSearch: (value: string) => console.log('Search:', value)
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems"
        (pageChange)="pageChange($event)"
      >
        <ng-template #filterTemplate>
          <pc-searchbar
            [value]="searchValue"
            placeholder="Search items..."
            buttonIcon="search-pokeball"
            (search)="onSearch($event)"
          ></pc-searchbar>
        </ng-template>
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 100,
  }
};

export const Loading: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [],
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [loading]="loading"
        [totalItems]="totalItems"
      >
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    loading: true,
    totalItems: 50
  }
};

export const Empty: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [],
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [totalItems]="totalItems"
        [emptyMessage]="emptyMessage"
      >
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    totalItems: 0,
    emptyMessage: 'No Pokemon found matching your criteria'
  }
};

export const ManyPages: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: generateMockItems(10),
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems"
        [maxPageButtons]="maxPageButtons"
        (pageChange)="pageChange($event)"
      >
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    currentPage: 50,
    pageSize: 10,
    totalItems: 1000,
    maxPageButtons: 5
  }
};

export const SimplePagination: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: generateMockItems(5),
    },
    template: `
      <pc-paginated-list
        [items]="items"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems"
        [showPageNumbers]="showPageNumbers"
        [showPageSizeSelector]="showPageSizeSelector"
        (pageChange)="pageChange($event)"
      >
        <ng-template #itemTemplate let-item>
          <story-item-card [item]="item"></story-item-card>
        </ng-template>
      </pc-paginated-list>
    `
  }),
  args: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 25,
    showPageNumbers: false,
    showPageSizeSelector: false
  }
};
