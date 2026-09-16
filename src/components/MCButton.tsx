import React from 'react';
import { mcAudio } from '../utils/audio';

interface MCButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'main' | 'small' | 'icon' | 'custom';
  subtitle?: string;
  children: React.ReactNode;
}

export const MCButton: React.FC<MCButtonProps> = ({
  size = 'main',
  subtitle,
  children,
  onClick,
  onMouseEnter,
  disabled,
  className = '',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    mcAudio.playClick();
    if (onClick) onClick(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onMouseEnter) {
      onMouseEnter(e);
    }
  };

  let sizeClasses = '';
  if (size === 'main') {
    sizeClasses = 'main-menu-button';
  } else if (size === 'small') {
    sizeClasses = 'small-menu-button';
  } else if (size === 'icon') {
    sizeClasses = 'language-button';
  }

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`minecraft-button ${sizeClasses} ${className}`}
    >
      <span>{children}</span>
      {subtitle && (
        <span className="text-[10px] text-gray-300 opacity-80 mt-0.5 block font-normal">
          {subtitle}
        </span>
      )}
    </button>
  );
};

