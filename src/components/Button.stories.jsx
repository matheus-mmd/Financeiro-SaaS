import Button from './Button';

/**
 * Exemplo de Storybook stories para o componente Button
 * Para usar: npx storybook@latest init
 */

export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

// Story: Primary Button
export const Primary = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button Primary',
  },
};

// Story: Secondary Button
export const Secondary = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Button Secondary',
  },
};

// Story: Ghost Button
export const Ghost = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Button Ghost',
  },
};

// Story: Danger Button
export const Danger = {
  args: {
    variant: 'danger',
    size: 'md',
    children: 'Excluir',
  },
};

// Story: Small Size
export const Small = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

// Story: Large Size
export const Large = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};

// Story: Disabled State
export const Disabled = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Disabled Button',
  },
};

// Story: With Icon
export const WithIcon = {
  args: {
    variant: 'primary',
    size: 'md',
    children: (
      <>
        <span className="mr-2">+</span>
        Adicionar
      </>
    ),
  },
};

// Story: All Variants
export const AllVariants = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
    <div className="flex gap-4">
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
    </div>
    <div className="flex gap-4">
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  </div>
);
