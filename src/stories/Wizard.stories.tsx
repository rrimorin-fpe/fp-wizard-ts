import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {     
  useWizardContext,
  WizardProvider,
  Step,
  Steps ,
  Wizard,
  DefaultWizardStepProps
} from '../Wizard';

const DynamicPage = ({ counter }: { counter: number }) => (
  <h1>Page {counter}</h1>
);

const Page1 = () => <DynamicPage counter={1} />;
const Page2 = () => <DynamicPage counter={2} />;
const Page3 = () => <DynamicPage counter={3} />;
const Page4 = () => <DynamicPage counter={4} />;

const MySteps = () => {
  const { activeStepIndex } = useWizardContext<DefaultWizardStepProps>();

  return (
    <Steps>
      <Step key={`page/1`} id={'1'} title="Step 1">
        <Page1 />
      </Step>
      <Step key={`page/2`} id={'2'} title="Step 2">
        <Page2 />
      </Step>
      <Step key={`page/3`} id={'3'} title="Step 3">
        <Page3 />
      </Step>
      <Step key={`page/4`} id={'4'} title="Step 4">
        <Page4 />
      </Step>
    </Steps>
  );
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Wizard',
  component: Wizard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Wizard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Wizard> = (args) => <Wizard {...args}>
  <MySteps/>
  </Wizard>;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
