import type { Meta, StoryObj } from '@storybook/angular';

import { Center } from '../lib/atoms/center/center';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<Center> = {
    title: 'Atoms/Center',
    component: Center,
    tags: ['autodocs'],
    argTypes: {
        maxWidth: {
            control: 'select',
            options: ['s-5', 's-4', 's-3', 's-2', 's-1', 's0', 's1', 's2', 's3', 's4', 's5', 'measure'],
        },
        gutterWidth: {
            control: 'select',
            options: ['s-5', 's-4', 's-3', 's-2', 's-1', 's0', 's1', 's2', 's3', 's4', 's5', 'measure', null],
        },
        centerText: {
            control: 'boolean',
        },
        intrinsic: {
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<Center>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple: Story = {
    args: {
        maxWidth: 'measure',
        centerText: false,
        intrinsic: false,
        gutterWidth: null
    },
    render: (args) => ({
        props: args,
        template: `
    <div style="background-color: lightgray; padding: 2rem;">
        <pc-center [maxWidth]="maxWidth">
            <span style="padding: 1rem; background-color: black; color: white;">Hello there</span>
        </pc-center>
     </div>
    `,
    }),
};

export const CenterText: Story = {
    args: {
        maxWidth: 'measure',
        centerText: true
    },
    render: (args) => ({
        props: args,
        template: `
    <div style="background-color: lightgray; padding: 2rem;">
        <pc-center [maxWidth]="maxWidth" [centerText]="centerText">
            <span style="padding: 1rem; background-color: black; color: white;">Hello there</span>
        </pc-center>
     </div>
    `,
    }),
};

export const Full: Story = {
    args: {
        maxWidth: 'measure',
        intrinsic: false,
        centerText: true,
        gutterWidth: "s2"
    },
    render: (args) => ({
        props: args,
        template: `
    <div style="background-color: lightgray; padding: 2rem;">
        <pc-center [maxWidth]="maxWidth" [intrinsic]="intrinsic" [gutterWidth]="gutterWidth" [centerText]="centerText">
            <span style="padding: 1rem; background-color: black; color: white;">Hello there</span>
        </pc-center>
    </div>
    `,
    }),
};