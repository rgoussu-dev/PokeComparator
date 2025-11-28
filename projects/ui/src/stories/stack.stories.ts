import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { Stack } from '../lib/atoms/stack/stack';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<Stack> = {
  title: 'Atoms/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    space: {
      control: 'text',
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
};

export default meta;
type Story = StoryObj<Stack>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    space: 's1',
  },
  render: (args) => ({
    props: args,
    template: `
      <stack [space]="space">
        <div style="background-color: lightgray; padding: 8px;">Item 1</div>
        <div style="background-color: lightgray; padding: 8px;">Item 2</div>
        <div style="background-color: lightgray; padding: 8px;">Item 3</div>
      </stack>
    `,
  }),
};