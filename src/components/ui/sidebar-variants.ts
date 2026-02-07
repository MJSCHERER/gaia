import { cva } from 'class-variance-authority';

export const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: '',
        outline: 'bg-background shadow-sm',
      },
      size: {
        default: 'h-8',
        sm: 'h-7 text-xs',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
