import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Define the sidebar context type
interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

// Create the sidebar context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Custom hook to use the sidebar context
export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// SidebarProvider component
interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  const value: SidebarContextType = {
    state: open ? 'expanded' : 'collapsed',
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

// Sidebar component
interface SidebarProps {
  children: ReactNode;
  className?: string;
  side?: 'left' | 'right';
  variant?: 'default' | 'inset';
  collapsible?: 'default' | 'icon' | 'none';
}

export function Sidebar({ 
  children, 
  className, 
  side = 'left',
  variant = 'default',
  collapsible = 'default',
  ...props 
}: SidebarProps) {
  const { open, openMobile, isMobile } = useSidebar();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && openMobile && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "relative h-full bg-background border-r transition-all duration-300 ease-in-out",
          {
            // Desktop states
            "w-64": !isMobile && open,
            "w-16": !isMobile && !open && collapsible === 'icon',
            "w-0": !isMobile && !open && collapsible === 'default',
            // Mobile states
            "fixed inset-y-0 left-0 z-50 w-64": isMobile && openMobile,
            "fixed inset-y-0 left-0 z-50 w-0": isMobile && !openMobile,
          },
          className
        )}
        {...props}
      >
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}

// Sidebar Header
interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Content
interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function SidebarContent({ children, className, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Footer
interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "p-4 border-t",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Menu
interface SidebarMenuProps {
  children: ReactNode;
  className?: string;
}

export function SidebarMenu({ children, className, ...props }: SidebarMenuProps) {
  return (
    <nav
      className={cn(
        "space-y-1",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

// Sidebar Menu Item
interface SidebarMenuItemProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function SidebarMenuItem({ children, className, asChild = false, ...props }: SidebarMenuItemProps) {
  const Comp = asChild ? React.Fragment : 'div';
  
  return (
    <Comp
      className={cn(
        !asChild && "block",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Sidebar Menu Button
interface SidebarMenuButtonProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarMenuButton({ 
  children, 
  className, 
  isActive = false,
  onClick,
  ...props 
}: SidebarMenuButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground focus:outline-none",
        {
          "bg-accent text-accent-foreground": isActive,
          "text-muted-foreground": !isActive,
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Sidebar Trigger (for mobile toggle)
interface SidebarTriggerProps {
  children?: ReactNode;
  className?: string;
}

export function SidebarTrigger({ children, className, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    >
      {children || (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  );
}