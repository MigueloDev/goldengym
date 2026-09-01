import React from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? Boolean(controlledOpen) : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setUncontrolledOpen(next);
      onOpenChange?.(next);
    }
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return children;
  const { open, setOpen } = ctx;

  const handleClick = (e: React.MouseEvent) => {
    children.props.onClick?.(e);
    setOpen(!open);
  };

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button type="button" onClick={handleClick} className="inline-flex">
      {children}
    </button>
  );
}

interface PopoverContentProps {
  className?: string;
  children: React.ReactNode;
}

export function PopoverContent({ className, children }: PopoverContentProps) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className={`absolute left-0 top-full mt-2 z-50 rounded-md border bg-white shadow ${className ?? ''}`}>
      {children}
    </div>
  );
}


