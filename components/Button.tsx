import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'game';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95";
  
  const variants = {
    primary: "bg-game-primary text-white shadow-[0_0_15px_rgba(255,0,128,0.5)] hover:shadow-[0_0_25px_rgba(255,0,128,0.7)] hover:-translate-y-1 border border-white/10",
    secondary: "bg-game-secondary text-white shadow-[0_0_15px_rgba(121,40,202,0.5)] hover:shadow-[0_0_25px_rgba(121,40,202,0.7)] hover:-translate-y-1 border border-white/10",
    game: "bg-gradient-to-r from-game-primary to-game-secondary text-white shadow-lg hover:shadow-xl hover:brightness-110 border border-white/20",
    outline: "border-2 border-game-muted/30 hover:border-game-accent hover:text-game-accent text-game-muted bg-transparent",
    ghost: "text-game-muted hover:bg-white/5 hover:text-white",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-16 px-10 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};