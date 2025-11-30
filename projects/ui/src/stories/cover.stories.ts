import { Meta, StoryObj } from '@storybook/angular';
import { Cover } from '../lib/atoms/cover/cover';
import { ALL_SIZES } from '../lib/types/size';

const meta: Meta<Cover> = {
  title: 'Atoms/Cover',
  component: Cover,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <pc-cover [centered]="centered" [space]="space" [minHeight]="minHeight" [noPad]="noPad">
        <div style="background: #e0e0e0; padding: 1rem;">Header</div>
        <h1 style="background: #c0c0ff; padding: 1rem;">Main Content</h1>
        <div style="background: #e0e0e0; padding: 1rem;">Footer</div>
      </pc-cover>
    `,
  }),
  argTypes: {
    centered: {
      control: 'text',
      description: 'Selector for the centered (main) element',
      defaultValue: 'h1',
    },
    space: {
      control: 'select',
      options: ALL_SIZES,
      description: 'Minimum space between/around children (Size | string)',
      defaultValue: 's1',
    },
    minHeight: {
      control: 'select',
      options: [...ALL_SIZES, '100vh', '80vh', '50vh'],
      description: 'Minimum block-size for the Cover (Size | string)',
      defaultValue: 'measure',
    },
    noPad: {
      control: 'boolean',
      description: 'Whether spacing is also applied as padding to the container',
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<Cover>;

export const Default: Story = {
  args: {
    centered: 'h1',
    space: 's1',
    minHeight: 'measure',
    noPad: false,
  },
};

export const CustomSpace: Story = {
  args: {
    centered: 'h1',
    space: '2rem',
    minHeight: 'measure',
    noPad: false,
  },
};

export const CustomMinHeight: Story = {
  args: {
    centered: 'h1',
    space: 's1',
    minHeight: '100vh',
    noPad: false,
  },
};

export const NoPad: Story = {
  args: {
    centered: 'h1',
    space: '2rem',
    minHeight: 'measure',
    noPad: true,
  },
};

export const CustomCentered: Story = {
  args: {
    centered: 'div',
    space: 's1',
    minHeight: '80vh',
    noPad: false,
  },
};
