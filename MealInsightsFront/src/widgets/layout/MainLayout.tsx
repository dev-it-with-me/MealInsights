import { Outlet } from 'react-router-dom';
import { 
  AppShell, 
  Text, 
  Group, 
  NavLink,
  Container,
  Burger,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconHome, 
  IconLeaf, 
  IconList,
  IconCalendar,
  IconShoppingCart,
  IconChartLine
} from '@tabler/icons-react';

const MainLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();

  const navigationItems = [
    { icon: IconHome, label: 'Home', href: '/' },
    { icon: IconList, label: 'All Ingredients', href: '/ingredients' },
    { icon: IconLeaf, label: 'Manage Ingredients', href: '/ingredients/manage' },
    { icon: IconCalendar, label: 'Meal Planning', href: '/meals' },
    { icon: IconShoppingCart, label: 'Shopping Lists', href: '/shopping' },
    { icon: IconChartLine, label: 'Nutrition Tracking', href: '/tracking' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group gap="xs">
              <IconLeaf size={28} color="#51cf66" />
              <Text
                size="xl"
                fw={700}
                variant="gradient"
                gradient={{ from: 'green', to: 'blue', deg: 45 }}
              >
                MealInsights
              </Text>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
          Navigation
        </Text>
        
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => {
                // Close mobile menu when navigation item is clicked
                if (window.innerWidth < 768) {
                  toggle();
                }
              }}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                marginBottom: rem(2),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: rem(8),
                  padding: `${rem(6)} ${rem(8)}`,
                  borderRadius: rem(4),
                  fontSize: rem(13),
                  fontWeight: 500,
                  backgroundColor: active ? 'var(--mantine-color-blue-light)' : 'transparent',
                  color: active ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-text)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent size={14} stroke={1.5} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px={0}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
