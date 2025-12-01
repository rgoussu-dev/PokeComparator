import { Meta, StoryObj } from '@storybook/angular';
import { Reel } from '../lib/atoms/reel/reel';

const meta: Meta<Reel> = {
  title: 'Atoms/Reel',
  component: Reel,
  argTypes: {
    itemWidth: { control: 'text' },
    space: { control: 'text' },
    height: { control: 'text' },
    noBar: { control: 'boolean' },
    role: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<Reel>;

export const Default: Story = {
  args: {
    itemWidth: '20rem',
    space: '1rem',
    height: 'auto',
    noBar: false,
    role: 'list',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 400px; border: 1px solid #ccc; overflow: hidden;">
        <pc-reel [itemWidth]="itemWidth" [space]="space" [height]="height" [noBar]="noBar" [role]="role">
          <div role="listitem" style="background:#eee; padding:1rem;">Card 1</div>
          <div role="listitem" style="background:#eee; padding:1rem;">Card 2</div>
          <div role="listitem" style="background:#eee; padding:1rem;">Card 3</div>
          <div role="listitem" style="background:#eee; padding:1rem;">Card 4</div>
          <div role="listitem" style="background:#eee; padding:1rem;">Card 5</div>
        </pc-reel>
      </div>
    `,
  }),
};

export const NoBar: Story = {
  args: {
    itemWidth: '10rem',
    space: '0.5rem',
    height: 'auto',
    noBar: true,
    role: 'list',
  },
  render: (args) => ({
    props: args,
    template: `
    <div style="width: 400px; border: 1px solid #ccc; overflow: hidden;">
      <pc-reel [itemWidth]="itemWidth" [space]="space" [height]="height" [noBar]="noBar" [role]="role">
        <div role="listitem" style="background:#cfc; padding:1rem;" tabindex="0">Link 1</div>
        <div role="listitem" style="background:#cfc; padding:1rem;">Link 2</div>
        <div role="listitem" style="background:#cfc; padding:1rem;">Link 3</div>
        <div role="listitem" style="background:#cfc; padding:1rem;">Link 4</div>
      </pc-reel>
    </div>
    `,
  }),
};

export const Images: Story = {
  args: {
    itemWidth: 'auto',
    space: '1rem',
    height: '50vh',
    noBar: false,
    role: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <pc-reel [itemWidth]="itemWidth" [space]="space" [height]="height" [noBar]="noBar">
        <img src="https://picsum.photos/id/1015/400/200" alt="img1" />
        <img src="https://picsum.photos/id/1016/400/200" alt="img2" />
        <img src="https://picsum.photos/id/1018/400/200" alt="img3" />
        <img src="https://picsum.photos/id/1020/400/200" alt="img4" />
      </pc-reel>
    `,
  }),
};
