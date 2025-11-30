import { Meta, StoryObj } from '@storybook/angular';
import { Grid } from '../lib/atoms/grid/grid';

const meta: Meta<Grid> = {
  title: 'Atoms/Grid',
  component: Grid,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <pc-grid [min]="min" [space]="space">
        <div style="background: #e0e0e0; padding: 1rem;">Cell 1</div>
        <div style="background: #c0c0ff; padding: 1rem;">Cell 2</div>
        <div style="background: #e0e0e0; padding: 1rem;">Cell 3</div>
        <div style="background: #c0c0ff; padding: 1rem;">Cell 4</div>
        <div style="background: #e0e0e0; padding: 1rem;">Cell 5</div>
      </pc-grid>
    `,
  }),
  argTypes: {
    min: {
      control: 'text',
      description: 'CSS length value for min column width',
      defaultValue: '250px',
    },
    space: {
      control: 'select',
      options: ['s-5','s-4','s-3','s-2','s-1','s0','s1','s2','s3','s4','s5','measure','var(--s1)','2rem','1em'],
      description: 'Space between grid cells (Size | string)',
      defaultValue: 's1',
    },
  },
};

export default meta;

type Story = StoryObj<Grid>;

export const Default: Story = {
  args: {
    min: "150px",
    space: "s-4",
  },
};

export const CustomSpace: Story = {
  args: {
    min: "100px",
    space: '2rem',
  },
};

export const CustomMin: Story = {
  args: {
    min: "25vh",
    space: 's1',
  },
};
