import type { Meta, StoryObj } from '@storybook/angular';

import { Switcher } from '../lib/atoms/switcher/switcher';
import { Size, ALL_SIZES } from '../lib/types/size';


interface SwitcherStoryArgs {
  threshold: Size | string;
  gap: Size;
  limit: number;
}
// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<SwitcherStoryArgs> = {
  title: 'Atoms/Switcher',
  component: Switcher,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ALL_SIZES,
    },
    threshold: {
      control: 'text',
      options: ALL_SIZES,
    },
    limit: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<SwitcherStoryArgs>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple: Story = {
  args: {
    threshold: "s1",
    gap: "s0",
    limit: 3
  },
  render: (args) => ({
    props: args,
    template: `
        <pc-switcher [threshold]="threshold" [limit]="limit" [space]="space">
          <div style="background-color: lightgray; padding: 8px;">Item 1</div>
          <div style="background-color: lightgray; padding: 8px;">Item 2</div>
          <div style="background-color: lightgray; padding: 8px;">Item 3</div>
          <div style="background-color: lightgray; padding: 8px;">Item 4</div>
          <div style="background-color: lightgray; padding: 8px;">Item 5</div>
        </pc-switcher>
    `,
  }),
};
