import { Meta, StoryObj } from '@storybook/angular';
import { Imposter } from '../lib/atoms/imposter/imposter';

const meta: Meta<Imposter> = {
  title: 'Atoms/Imposter',
  component: Imposter,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; width: 400px; height: 500px; background: #f0f0f0;">
        <span style="position: absolute; top: 8px; left: 8px; color: #888; font-size: 0.9em;">Container (400x500px)</span>
        <div style="padding: 2rem; color: #333; font-size: 1.1em; line-height: 1.6;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis enim urna eu nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam at dictum sem. Mauris euismod, sapien eu commodo dictum, enim erat cursus enim, nec dictum enim enim eu enim. Etiam euismod, enim eu dictum dictum, enim enim dictum enim, eu dictum enim enim eu enim. Etiam euismod, enim eu dictum dictum, enim enim dictum enim, eu dictum enim enim eu enim. Etiam euismod, enim eu dictum dictum, enim enim dictum enim, eu dictum enim enim eu enim.
        </div>
        <pc-imposter [breakout]="breakout" [margin]="margin" [fixed]="fixed">
          <div style="background: #c0c0ff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px #0002;">
            <strong>Imposter Content</strong><br>
            <span style="font-size: 0.9em; color: #444;">This element is centered and can break out or be contained.</span>
          </div>
        </pc-imposter>
      </div>
    `,
  }),
  argTypes: {
    breakout: {
      control: 'boolean',
      description: 'Allow element to break out of container',
      defaultValue: false,
    },
    margin: {
      control: 'text',
      description: 'Minimum space between element and container edge',
      defaultValue: '0',
    },
    fixed: {
      control: 'boolean',
      description: 'Position relative to viewport',
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<Imposter>;

export const Default: Story = {
  args: {
    breakout: false,
    margin: '0',
    fixed: false,
  },
};

export const WithMargin: Story = {
  args: {
    breakout: false,
    margin: '32px',
    fixed: false,
  },
};

export const Breakout: Story = {
  args: {
    breakout: true,
    margin: '0',
    fixed: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; width: 400px; height: 500px; background: #f0f0f0;">
        <span style="position: absolute; top: 8px; left: 8px; color: #888; font-size: 0.9em;">Container (400x500px)</span>
        <div style="padding: 2rem; color: #333; font-size: 1.1em; line-height: 1.6;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis enim urna eu nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam at dictum sem. Mauris euismod, sapien eu commodo dictum, enim erat cursus enim, nec dictum enim enim eu enim. Etiam euismod, enim eu dictum dictum, enim enim dictum enim, eu dictum enim enim eu enim. Etiam euismod, enim eu dictum dictum, enim enim dictum enim, eu dictum enim enim eu enim. Etiam euismod, enim eu dictum dictum, enim enim dictum enim, eu dictum enim enim eu enim.
        </div>
        <pc-imposter [breakout]="breakout" [margin]="margin" [fixed]="fixed">
          <div style="background: #c0c0ff; padding: 2.5rem 3rem; border-radius: 12px; box-shadow: 0 2px 16px #0004; border: 3px solid #ff4081; font-size: 1.2em;">
            <strong>Imposter Content (Breakout)</strong><br>
            <span style="font-size: 0.9em; color: #444;">This imposter visually breaks out of the container. Lorem Ipsum dolor sit amet, consectetur adipiscing elit.</span>
          </div>
        </pc-imposter>
      </div>
    `,
  }),
};

export const Fixed: Story = {
  args: {
    breakout: false,
    margin: '0',
    fixed: true,
  },
};
