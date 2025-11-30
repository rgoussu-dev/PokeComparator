import type { Meta, StoryObj } from '@storybook/angular';

import { Box } from '../lib/atoms/box/box';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<Box> = {
  title: 'Atoms/Box',
  component: Box,
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
        options: ['s-5', 's-4', 's-3', 's-2', 's-1', 's0', 's1', 's2', 's3', 's4', 's5', 'measure'],
    },
    borderWidth: {
      control: 'select',
        options: ['s-5', 's-4', 's-3', 's-2', 's-1', 's0', 's1', 's2', 's3', 's4', 's5', 'measure', null],
    },
    backgroundColor: {
      control: 'color',
    },
    color: {
        control: 'color',
    },
  },
  parameters: {
    layout: 'centered',
  },

};

export default meta;
type Story = StoryObj<Box>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple: Story = {
  args: {
    padding: 's1',
    borderWidth: 's1',
    backgroundColor: 'green'
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-box [padding]="padding" [borderWidth]="borderWidth" [backgroundColor]="backgroundColor">
              <span>Hello, there</span>
      </pc-box>
    `,
  }),
};

export const Bordered: Story = {
  args: {
    padding: 's1',
    borderWidth: 's-3',
    backgroundColor: 'darkblue',
    color: 'lightblue'
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-box [padding]="padding" [borderWidth]="borderWidth" [backgroundColor]="backgroundColor" [color]="color">
            <span>Hello, there</span>
      </pc-box>
    `,
  }),
};

export const UnborderedHighContrast: Story = {
  args: {
    padding: 's1',
    borderWidth: null,
    backgroundColor: 'darkblue',
    color: 'lightblue'
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-box [padding]="padding" [borderWidth]="borderWidth" [backgroundColor]="'black'" [color]="'grey'">
        <pc-box [padding]="padding" [borderWidth]="borderWidth" [backgroundColor]="backgroundColor" [color]="color">
          <span>Hello, there</span>
        </pc-box>
      </pc-box>
    `,
  }),
};