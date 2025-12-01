import { Meta, StoryObj } from '@storybook/angular';
import { Icon } from '../lib/atoms/icon/icon';

const meta: Meta<Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <pc-icon [iconHref]="iconHref" [space]="space" [label]="label">
        Close
      </pc-icon>
      <!-- Inline SVG sprite for demo purposes -->
      <svg style="display:none;">
        <symbol id="hero-x-mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
          <line x1="28" y1="2" x2="2" y2="28" />
          <line x1="2" y1="2" x2="28" y2="28" />
        </symbol>
      </svg>
    `,
  }),
  argTypes: {
    iconHref: {
      control: 'text',
      description: 'SVG icon reference (use href)',
      defaultValue: '#hero-x-mark',
    },
    space: {
      control: 'text',
      description: 'Space between icon and text',
      defaultValue: 's-1',
    },
    label: {
      control: 'text',
      description: 'ARIA label for accessibility',
      defaultValue: 'Close icon',
    },
  },
};

export default meta;

type Story = StoryObj<Icon>;

export const Default: Story = {
  args: {
    iconHref: '#hero-x-mark',
  },
};

export const WithSpace: Story = {
  args: {
    iconHref: '#hero-x-mark',
    space: '1rem'
  },
};

export const WithLabel: Story = {
  args: {
    iconHref: '#hero-x-mark',
    space: "s2",
    label: 'Close icon',
  },
};
