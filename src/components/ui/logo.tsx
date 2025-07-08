import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icône stylisée représentant atelier couture */}
      <div className={cn(
        "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-card",
        sizeClasses[size]
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className={cn("w-3/4 h-3/4 text-white")}
        >
          {/* Aiguille et fil stylisés */}
          <path 
            d="M12 2L10 4L12 6L14 4L12 2Z" 
            fill="currentColor"
          />
          <path 
            d="M12 6L12 18" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path 
            d="M8 14C8 14 10 12 12 14C14 16 16 14 16 14" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold text-primary leading-none",
            textSizeClasses[size]
          )}>
            AtelierPro
          </span>
          <span className="text-xs text-muted-foreground leading-none">
            Gestion Couture
          </span>
        </div>
      )}
    </div>
  );
}