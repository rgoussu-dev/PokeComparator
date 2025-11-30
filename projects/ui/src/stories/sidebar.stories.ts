import { Meta, StoryObj } from '@storybook/angular';
import { Sidebar } from '../lib/atoms/sidebar/sidebar';

const meta: Meta<Sidebar> = {
  title: 'Atoms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <pc-sidebar [side]="side" [sideWidth]="sideWidth" [contentMin]="contentMin" [space]="space" [noStretch]="noStretch">
        <div style="background: #e0e0e0; padding: 1rem;">Sidebar</div>
        <div style="background: #c0c0ff; padding: 1rem;">Content</div>
      </pc-sidebar>
    `,
  }),
  argTypes: {
    side: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Which element to treat as the sidebar',
      defaultValue: 'left',
    },
    sideWidth: {
      control: 'text',
      description: `Represents the width of the sidebar when adjacent. If not set (null) it defaults to the sidebar's content width`,
      defaultValue: '',
    },
    contentMin: {
      control: 'text',
      description: 'A CSS percentage value. The minimum width of the content element in the horizontal configuration',
      defaultValue: '50%',
    },
    space: {
      control: 'text',
      description: 'A CSS margin value representing the space between the two elements',
      defaultValue: 'var(--s1)',
    },
    noStretch: {
      control: 'boolean',
      description: 'Make the adjacent elements adopt their natural height',
      defaultValue: false,
    },
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<Sidebar>;

export const Default: Story = {
  args: {
    side: 'left',
    sideWidth: '',
    contentMin: '50%',
    space: 'var(--s1)',
    noStretch: false,
  },
};

export const RightSidebar: Story = {
  args: {
    side: 'right',
    sideWidth: '250px',
    contentMin: '60%',
    space: '2rem',
    noStretch: false,
  },
};

export const NoStretch: Story = {
  args: {
    side: 'left',
    sideWidth: '200px',
    contentMin: '40%',
    space: '1rem',
    noStretch: true,
  },
};
