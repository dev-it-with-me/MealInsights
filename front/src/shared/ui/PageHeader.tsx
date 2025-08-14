import React from "react";
import { Group, Stack, Title, Text } from "@/shared/ui-kit";

/**
 * PageHeader - A reusable component for consistent page headers across the application
 *
 * Features:
 * - Gradient icon container matching the MainLayout design system
 * - Consistent typography and colors (var(--color-surface-*))
 * - Optional description text below the title
 * - Optional right content for actions/additional info
 * - Responsive layout with proper spacing
 *
 * @example
 * <PageHeader
 *   icon={IconChefHat}
 *   title="Manage Meals"
 *   description="Create, edit, and organize your meal recipes"
 *   rightContent={<Button>Add Meal</Button>}
 * />
 */
export interface PageHeaderProps {
  /** The icon component to display (from @tabler/icons-react) */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** The main title of the page */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Additional content to display on the right side of the header */
  rightContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: IconComponent,
  title,
  description,
  rightContent,
}) => {
  return (
    <div className="mt-16">
      <Group justify="space-between" align="center">
        <Stack gap="xs">
          <Group gap="sm">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(45deg, var(--color-primary-400), var(--color-secondary-400))`,
              }}
            >
              <IconComponent size={20} className="text-white" />
            </div>
            <Title
              order={1}
              style={{
                color: "var(--color-surface-50)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              {title}
            </Title>
          </Group>
          {description && (
            <Text size="lg" style={{ color: "var(--color-surface-300)" }}>
              {description}
            </Text>
          )}
        </Stack>
        {rightContent && <div>{rightContent}</div>}
      </Group>
    </div>
  );
};
