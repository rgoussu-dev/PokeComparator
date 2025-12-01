import { Meta, StoryObj } from '@storybook/angular';
import { Header } from '../lib/molecule/header/header';

const meta: Meta<Header> = {
  title: 'Molecule/Header',
  component: Header,
  tags: ['autodocs'],
  render: (args) => ({
    component: Header,
    props: args,
  }),
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<Header>;

export const Default: Story = {
  args: {
    title: 'PokeComparator',
    subtitle: "Compare them all !",
    logoSrc: '/assets/ui/logo.svg',
    links: [
      { label: 'Catalog', href: '#', callback: () => alert('Catalog clicked') },
      { label: 'Compare', href: '#', callback: () => alert('Compare clicked') },
      { label: 'Detail', href: '#', callback: () => alert('Detail clicked') },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
        <pc-header [title]="title" [subtitle]="subtitle" [logoSrc]="logoSrc" [links]="links"></pc-header>
    `,
  }),
};
