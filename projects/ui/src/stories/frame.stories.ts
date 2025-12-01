import { Meta, StoryObj } from '@storybook/angular';
import { Frame } from '../lib/atoms/frame/frame';

const meta: Meta<Frame> = {
  title: 'Atoms/Frame',
  component: Frame,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <pc-frame [ratio]="ratio">
        <img src="https://picsum.photos/1920/1080" alt="Random photo" />
      </pc-frame>
    `,
  }),
  argTypes: {
    ratio: {
      control: 'text',
      description: 'Aspect ratio (n:d)',
      defaultValue: '16:9',
    },
  },
};

export default meta;

type Story = StoryObj<Frame>;

export const Default: Story = {
  args: {
    ratio: '16:9',
  },
};

export const Square: Story = {
  args: {
    ratio: '1:1',
  },
};

export const Portrait: Story = {
  args: {
    ratio: '3:4',
  },
};

export const UltraWide: Story = {
  args: {
    ratio: '21:9',
  },
};
