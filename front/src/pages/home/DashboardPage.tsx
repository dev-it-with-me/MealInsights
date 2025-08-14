import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Button,
  Grid,
  Container,
  ActionIcon,
  SimpleGrid,
  Divider,
  Paper,
} from "@/shared/ui-kit";
import { Link } from "react-router-dom";
import {
  IconChefHat,
  IconCalendar,
  IconList,
  IconShoppingCart,
  IconTrendingUp,
  IconClock,
  IconFlame,
  IconApple,
  IconTarget,
  IconChevronRight,
  IconMeat,
  IconBread,
  IconDroplet,
} from "@tabler/icons-react";

// Custom Progress component
const Progress = ({
  value,
  size = "md",
  radius = "md",
  color = "primary",
  mb,
  ...props
}: any) => {
  const getColorVar = (colorName: string) => {
    switch (colorName) {
      case "primary":
        return "var(--color-primary-500)";
      case "secondary":
        return "var(--color-secondary-500)";
      case "success":
        return "var(--color-success-500)";
      case "warning":
        return "var(--color-warning-500)";
      case "error":
        return "var(--color-error-500)";
      default:
        return "var(--color-primary-500)";
    }
  };

  return (
    <div
      className={`w-full bg-surface-800 rounded-${radius} h-${
        size === "lg" ? "4" : size === "sm" ? "2" : "3"
      } ${mb ? `mb-${mb}` : ""} progress-glow`}
      {...props}
    >
      <div
        className={`h-full rounded-${radius} transition-all duration-300`}
        style={{
          width: `${Math.min(value, 100)}%`,
          background: `linear-gradient(90deg, ${getColorVar(
            color
          )}, color-mix(in srgb, ${getColorVar(color)} 80%, white))`,
        }}
      />
    </div>
  );
};

// Custom Avatar component
const Avatar = ({ size = "md", radius = "md", children, ...props }: any) => (
  <div
    className={`flex items-center justify-center bg-surface-700 text-surface-50 rounded-${radius} ${
      size === "md" ? "w-10 h-10" : size === "lg" ? "w-12 h-12" : "w-8 h-8"
    }`}
    {...props}
  >
    {children}
  </div>
);

const DashboardPage = () => {
  // Mock data - in real app this would come from APIs
  const stats = {
    totalMeals: 24,
    plannedMeals: 5,
    totalIngredients: 67,
    todayCalories: 1850,
    targetCalories: 2200,
    macros: {
      protein: { current: 85, target: 110 },
      carbs: { current: 210, target: 250 },
      fat: { current: 65, target: 80 },
    },
  };

  const todaysMeals = [
    {
      name: "Mediterranean Bowl",
      calories: 520,
      time: "12 min",
      type: "Lunch",
      image: "🥗",
      color: "success",
    },
    {
      name: "Protein Smoothie",
      calories: 280,
      time: "5 min",
      type: "Snack",
      image: "🥤",
      color: "primary",
    },
    {
      name: "Grilled Salmon",
      calories: 450,
      time: "15 min",
      type: "Dinner",
      image: "🐟",
      color: "warning",
    },
    {
      name: "Greek Yogurt",
      calories: 180,
      time: "2 min",
      type: "Breakfast",
      image: "🥛",
      color: "secondary",
    },
  ];

  const quickActions = [
    {
      title: "Log Today's Meals",
      description: "Track your nutrition",
      icon: IconChefHat,
      color: "primary",
      href: "/diet-plan",
      time: "2 min",
    },
    {
      title: "Plan Tomorrow",
      description: "Meal planning made easy",
      icon: IconCalendar,
      color: "success",
      href: "/diet-plan",
      time: "5 min",
    },
    {
      title: "Browse Recipes",
      description: "Discover new meals",
      icon: IconApple,
      color: "warning",
      href: "/meals/manage",
      time: "10 min",
    },
    {
      title: "Shopping List",
      description: "Generate your list",
      icon: IconShoppingCart,
      color: "secondary",
      href: "/shopping-list",
      time: "3 min",
    },
  ];

  const nutritionInsights = [
    {
      title: "Daily Nutrition",
      description: "Track your macros",
      value: `${Math.round(
        (stats.todayCalories / stats.targetCalories) * 100
      )}%`,
      image: "📊",
      color: "primary",
    },
    {
      title: "Protein Goal",
      description: "Build and maintain muscle",
      value: `${stats.macros.protein.current}g`,
      image: "🥩",
      color: "error",
    },
    {
      title: "Hydration",
      description: "Stay hydrated today",
      value: "6/8 glasses",
      image: "💧",
      color: "primary",
    },
    {
      title: "Weekly Progress",
      description: "You're doing great!",
      value: "5/7 days",
      image: "📈",
      color: "success",
    },
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const calorieProgress = (stats.todayCalories / stats.targetCalories) * 100;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, var(--color-surface-950) 0%, var(--color-surface-900) 100%)",
      }}
    >
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header Section - Calm Style */}
          <div className="mb-8">
            <Title
              order={1}
              size="2.5rem"
              fw={300}
              mb="xs"
              style={{ color: "var(--color-surface-50)" }}
            >
              {getCurrentGreeting()}, John
            </Title>
            <Text size="lg" style={{ color: "var(--color-surface-400)" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </div>

          {/* Today's Meals Section */}
          <div>
            <Group justify="space-between" align="center" mb="lg">
              <Title
                order={2}
                size="1.5rem"
                fw={500}
                style={{ color: "var(--color-surface-50)" }}
              >
                Today's Meals
              </Title>
              <Button
                variant="subtle"
                size="sm"
                component={Link}
                to="/diet-plan"
                rightSection={<IconChevronRight size={14} />}
                style={{ color: "var(--color-primary-400)" }}
              >
                See All
              </Button>
            </Group>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {todaysMeals.map((meal, index) => (
                <Card
                  key={index}
                  p="lg"
                  radius="xl"
                  className="flex-shrink-0 hover:shadow-xl transition-all duration-300"
                  style={{
                    width: "280px",
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${meal.color}-500) 15%, transparent), color-mix(in srgb, var(--color-${meal.color}-600) 10%, transparent))`,
                    border: `1px solid color-mix(in srgb, var(--color-${meal.color}-500) 30%, transparent)`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                      <Badge
                        size="sm"
                        variant="light"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-${meal.color}-500) 20%, transparent)`,
                          color: `var(--color-${meal.color}-300)`,
                        }}
                      >
                        {meal.time}
                      </Badge>
                      <Text size="2xl">{meal.image}</Text>
                    </Group>

                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="xs"
                        style={{ color: "var(--color-surface-100)" }}
                      >
                        {meal.type}
                      </Text>
                      <Text
                        size="lg"
                        fw={600}
                        mb="xs"
                        style={{ color: "var(--color-surface-50)" }}
                      >
                        {meal.name}
                      </Text>
                      <Text
                        size="sm"
                        style={{ color: "var(--color-surface-300)" }}
                      >
                        {meal.calories} calories
                      </Text>
                    </div>
                  </Stack>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <Group justify="space-between" align="center" mb="lg">
              <Title
                order={2}
                size="1.5rem"
                fw={500}
                style={{ color: "var(--color-surface-50)" }}
              >
                Quick Actions
              </Title>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  component={Link}
                  to={action.href}
                  p="lg"
                  radius="xl"
                  className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${action.color}-500) 15%, transparent), color-mix(in srgb, var(--color-${action.color}-600) 10%, transparent))`,
                    border: `1px solid color-mix(in srgb, var(--color-${action.color}-500) 30%, transparent)`,
                    backdropFilter: "blur(10px)",
                    textDecoration: "none",
                  }}
                >
                  <Stack gap="md">
                    <Group justify="space-between">
                      <ActionIcon
                        variant="light"
                        size="lg"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-${action.color}-500) 20%, transparent)`,
                          color: `var(--color-${action.color}-300)`,
                        }}
                      >
                        <action.icon size={20} />
                      </ActionIcon>
                      <Badge
                        size="xs"
                        variant="light"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-${action.color}-500) 15%, transparent)`,
                          color: `var(--color-${action.color}-300)`,
                        }}
                      >
                        {action.time}
                      </Badge>
                    </Group>

                    <div>
                      <Text
                        size="md"
                        fw={600}
                        mb="xs"
                        style={{ color: "var(--color-surface-50)" }}
                      >
                        {action.title}
                      </Text>
                      <Text
                        size="sm"
                        style={{ color: "var(--color-surface-300)" }}
                      >
                        {action.description}
                      </Text>
                    </div>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </div>

          {/* Nutrition Insights Section */}
          <div>
            <Group justify="space-between" align="center" mb="lg">
              <Title
                order={2}
                size="1.5rem"
                fw={500}
                style={{ color: "var(--color-surface-50)" }}
              >
                Nutrition Insights
              </Title>
              <Button
                variant="subtle"
                size="sm"
                component={Link}
                to="/dashboard"
                rightSection={<IconChevronRight size={14} />}
                style={{ color: "var(--color-primary-400)" }}
              >
                See All
              </Button>
            </Group>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {nutritionInsights.map((insight, index) => (
                <Card
                  key={index}
                  p="lg"
                  radius="xl"
                  className="flex-shrink-0 hover:shadow-xl transition-all duration-300"
                  style={{
                    width: "240px",
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${insight.color}-500) 15%, transparent), color-mix(in srgb, var(--color-${insight.color}-600) 10%, transparent))`,
                    border: `1px solid color-mix(in srgb, var(--color-${insight.color}-500) 30%, transparent)`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <Text size="2xl">{insight.image}</Text>
                      <Text
                        size="xl"
                        fw={700}
                        style={{ color: `var(--color-${insight.color}-300)` }}
                      >
                        {insight.value}
                      </Text>
                    </Group>

                    <div>
                      <Text
                        size="md"
                        fw={600}
                        mb="xs"
                        style={{ color: "var(--color-surface-50)" }}
                      >
                        {insight.title}
                      </Text>
                      <Text
                        size="sm"
                        style={{ color: "var(--color-surface-300)" }}
                      >
                        {insight.description}
                      </Text>
                    </div>
                  </Stack>
                </Card>
              ))}
            </div>
          </div>

          {/* Today's Progress Summary */}
          <Card
            p="xl"
            radius="xl"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary-500) 10%, transparent), color-mix(in srgb, var(--color-secondary-500) 8%, transparent))`,
              border: `1px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent)`,
              backdropFilter: "blur(10px)",
            }}
          >
            <Group justify="space-between" align="center" mb="lg">
              <div>
                <Title
                  order={3}
                  size="1.25rem"
                  fw={500}
                  style={{ color: "var(--color-surface-50)" }}
                >
                  Today's Summary
                </Title>
                <Text size="sm" style={{ color: "var(--color-surface-300)" }}>
                  You're on track with your nutrition goals
                </Text>
              </div>
              <Badge
                size="lg"
                variant="light"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-success-500) 20%, transparent)`,
                  color: "var(--color-success-300)",
                }}
              >
                Great Progress!
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <div>
                <Text
                  size="sm"
                  mb="xs"
                  style={{ color: "var(--color-surface-300)" }}
                >
                  Calories
                </Text>
                <Progress
                  value={calorieProgress}
                  size="md"
                  radius="lg"
                  color={calorieProgress > 100 ? "error" : "success"}
                  mb="xs"
                />
                <Text size="xs" style={{ color: "var(--color-surface-400)" }}>
                  {stats.todayCalories} / {stats.targetCalories} kcal
                </Text>
              </div>

              <div>
                <Text
                  size="sm"
                  mb="xs"
                  style={{ color: "var(--color-surface-300)" }}
                >
                  Protein
                </Text>
                <Progress
                  value={
                    (stats.macros.protein.current /
                      stats.macros.protein.target) *
                    100
                  }
                  size="md"
                  radius="lg"
                  color="error"
                  mb="xs"
                />
                <Text size="xs" style={{ color: "var(--color-surface-400)" }}>
                  {stats.macros.protein.current}g /{" "}
                  {stats.macros.protein.target}g
                </Text>
              </div>

              <div>
                <Text
                  size="sm"
                  mb="xs"
                  style={{ color: "var(--color-surface-300)" }}
                >
                  Carbs
                </Text>
                <Progress
                  value={
                    (stats.macros.carbs.current / stats.macros.carbs.target) *
                    100
                  }
                  size="md"
                  radius="lg"
                  color="warning"
                  mb="xs"
                />
                <Text size="xs" style={{ color: "var(--color-surface-400)" }}>
                  {stats.macros.carbs.current}g / {stats.macros.carbs.target}g
                </Text>
              </div>
            </SimpleGrid>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default DashboardPage;
