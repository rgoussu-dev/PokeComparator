import { Meta } from '@storybook/angular';
import { Cluster } from '../lib/atoms/cluster/cluster';
import { ALL_ALIGN_ITEMS, ALL_JUSTIFY_CONTENT } from '../lib/types/alignement';

export default {
  title: 'Atoms/Cluster',
  component: Cluster,
  argTypes: {
    space: { control: 'text'},
    justify: { control: 'select', options: ALL_JUSTIFY_CONTENT },
    align: { control: 'select', options: ALL_ALIGN_ITEMS },
  },
} as Meta<Cluster>;

const itemStyle = `display:inline-flex; padding:8px 12px; background:#eef; border-radius:6px; border:1px solid #ccd;`;

const Template = (args: any) => ({
  props: args,
  template: `
    <pc-cluster [space]="space" [justify]="justify" [align]="align">
      <div style="${itemStyle}">One</div>
      <div style="${itemStyle}">Two</div>
      <div style="${itemStyle}">Three</div>
    </pc-cluster>
  `,
});

export const Default = {
  render: Template,
  args: { space: 's1', justify: 'flex-start', align: 'flex-start' },
};

export const Spacing = {
  render: Template,
  args: { space: 's5' },
};

export const JustifyCenter = {
  render: Template,
  args: { justify: 'center' },
};

export const AlignCenter = {
  render: Template,
  args: { align: 'center' },
};

export const CustomSpace = {
  render: (args: any) => ({
    props: args,
    template: `
      <pc-cluster [space]="space" [justify]="justify" align="align">
        <div style="${itemStyle}">One</div>
        <div style="${itemStyle}">Two</div>
        <div style="${itemStyle}">Three</div>
        <div style="${itemStyle}">Four</div>
        <div style="${itemStyle}">Five</div>
        <div style="${itemStyle}">Six</div>
        <div style="${itemStyle}">Seven</div>
      </pc-cluster>
    `,
  }),
  args: {
    space: "s5",
    justify: "flex-start",
    align: "flex-end"
  },
};
