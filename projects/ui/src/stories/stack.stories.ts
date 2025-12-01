import type { Meta, StoryObj } from '@storybook/angular';

import { Stack } from '../lib/atoms/stack/stack';


interface StackStoryArgs {
  space: 's-5' | 's-4' | 's-3' | 's-2' | 's-1' | 's0' | 's1' | 's2' | 's3' | 's4' | 's5' | 'measure';
  otherSpace?: 's-5' | 's-4' | 's-3' | 's-2' | 's-1' | 's0' | 's1' | 's2' | 's3' | 's4' | 's5' | 'measure';
  recursive?: boolean;
}
// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<StackStoryArgs> = {
  title: 'Atoms/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    space: {
      control: 'select',
      options: ['s-5', 's-4', 's-3', 's-2', 's-1', 's0', 's1', 's2', 's3', 's4', 's5', 'measure'],
    },
    otherSpace: {
      control: 'select',
      options: ['s-5', 's-4', 's-3', 's-2', 's-1', 's0', 's1', 's2', 's3', 's4', 's5', 'measure'],
    },
    recursive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<StackStoryArgs>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple: Story = {
  args: {
    space: 's1',
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-stack [space]="space">
        <div style="background-color: lightgray; padding: 8px;">Item 1</div>
        <div style="background-color: lightgray; padding: 8px;">Item 2</div>
        <div style="background-color: lightgray; padding: 8px;">Item 3</div>
      </pc-stack>
    `,
  }),
};

export const Nested: Story = {
  args: {
    space: 's1',
    otherSpace: 's2'
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-stack [space]="space">

        <div style="background-color: lightgray; padding: 8px;">Item 1</div>
        <div style="background-color: lightgray; padding: 8px;">Item 2</div>
        <div style="background-color: lightgray; padding: 8px;">Item 3</div>
        <pc-stack [space]="otherSpace">
          <div style="background-color: lightgray; padding: 8px;">Nested Item 1</div>
          <div style="background-color: lightgray; padding: 8px;">Nested Item 2</div>
          <div style="background-color: lightgray; padding: 8px;">Nested Item 2</div>
        </pc-stack>
      </pc-stack>
    `,
  }),
};

export const Recursive: Story = {
  args: {
    space: 's1',
    recursive: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-stack [space]="space" [recursive]="recursive">
        <div style="background-color: lightgray; padding: 8px;">Item 1</div>
        <div style="background-color: lightgray; padding: 8px;">Item 2</div>
        <div style="background-color: lightgray; padding: 8px;">Item 3</div>
        <div style="background-color: lightgray; padding: 8px;">
          <div style="background-color: black; padding: 8px; color: white;">Nested Item 1</div>
          <div style="background-color: black; padding: 8px; color: white;">Nested Item 2</div>
          <pc-stack [space]="otherSpace">
            <div style="background-color: black; padding: 8px; color: white;">Deeply Nested Item 1</div>
            <div style="background-color: black; padding: 8px; color: white;">Deeply Nested Item 2</div>
          </pc-stack>
        </div>
      </pc-stack>
    `,
  }),
};