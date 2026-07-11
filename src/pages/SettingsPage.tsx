import { Moon, Sun, SunMoon } from 'lucide-react';

import { PageHeader } from '@components/common/PageHeader';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { THEMES } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { cn } from '@lib/utils';

const THEME_ICONS = { light: Sun, dark: Moon, system: SunMoon } as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your workspace preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Axiora Pulse looks on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {THEMES.map((option) => {
            const Icon = THEME_ICONS[option];
            return (
              <Button
                key={option}
                variant={theme === option ? 'default' : 'outline'}
                size="sm"
                className={cn('gap-2 capitalize')}
                onClick={() => setTheme(option)}
              >
                <Icon className="size-4" />
                {option}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
