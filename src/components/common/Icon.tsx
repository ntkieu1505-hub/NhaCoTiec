import React from 'react';
import { clsx } from 'clsx';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size }) => {
  return (
    <span
      className={clsx('material-symbols-outlined select-none inline-block align-middle', className)}
      style={size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : undefined}
    >
      {name}
    </span>
  );
};
