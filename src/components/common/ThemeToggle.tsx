import { Check, Moon, Monitor, Sun } from 'lucide-react';

import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { useTheme } from '@hooks/useTheme';
import { cn } from '@lib/utils';

interface ThemeToggleProps {
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function ThemeToggle({ className, align = 'end' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Toggle theme (Light / Dark / System)"
          aria-label="Toggle theme"
          className={cn(
            'border-border/60 bg-background/60 hover:bg-accent hover:text-accent-foreground relative size-9 shrink-0 rounded-full border shadow-xs backdrop-blur-xs transition-all duration-200 focus-visible:ring-1',
            className,
          )}
        >
          <Sun className="size-4.25 scale-100 rotate-0 text-amber-500 transition-all duration-300 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4.25 scale-0 rotate-90 text-sky-400 transition-all duration-300 dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-[140px] p-1 shadow-md">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'flex cursor-pointer items-center justify-between text-xs font-medium',
            theme === 'light' && 'bg-accent/80 font-semibold',
          )}
        >
          <span className="flex items-center gap-2">
            <Sun className="size-4 text-amber-500" />
            Light
          </span>
          {theme === 'light' && <Check className="text-primary size-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'flex cursor-pointer items-center justify-between text-xs font-medium',
            theme === 'dark' && 'bg-accent/80 font-semibold',
          )}
        >
          <span className="flex items-center gap-2">
            <Moon className="size-4 text-sky-400" />
            Dark
          </span>
          {theme === 'dark' && <Check className="text-primary size-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'flex cursor-pointer items-center justify-between text-xs font-medium',
            theme === 'system' && 'bg-accent/80 font-semibold',
          )}
        >
          <span className="flex items-center gap-2">
            <Monitor className="text-muted-foreground size-4" />
            System
          </span>
          {theme === 'system' && <Check className="text-primary size-3.5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
