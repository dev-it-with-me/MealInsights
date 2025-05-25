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

      <AppShell.Navbar p="md">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Navigation
        </Text>
        
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            to={item.href}
            label={item.label}
            leftSection={<item.icon size={rem(16)} stroke={1.5} />}
            active={isActive(item.href)}
            variant="filled"
            onClick={() => {
              // Close mobile menu when navigation item is clicked
              if (window.innerWidth < 768) {
                toggle();
              }
            }}
            style={{
              borderRadius: rem(8),
              marginBottom: rem(4),
            }}
          />
        ))}
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
