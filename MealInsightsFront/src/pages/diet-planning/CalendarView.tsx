import { useState } from 'react';
import {
  Box,
  Text,
  Group,
  ActionIcon,
  Grid,
  Card,
  Badge,
  Stack,
  Title,
  Loader,
  Alert,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import type { ViewMode } from './DietPlanningPage';
import { useDailyCaloriesForRange } from '../../entities/diet-planning/api/hooks';

dayjs.extend(weekOfYear);

export interface CalendarViewProps {
  viewMode: ViewMode;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarView = ({
  viewMode,
  dateRange,
  selectedDate,
  onDateSelect,
}: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs(selectedDate));
  
  // Fetch daily calories for the current date range
  const { data: dailyCalories, isLoading, error } = useDailyCaloriesForRange(
    dayjs(dateRange.startDate).format('YYYY-MM-DD'),
    dayjs(dateRange.endDate).format('YYYY-MM-DD')
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  const renderDayCell = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const isSelected = date.isSame(selectedDate, 'day');
    const isToday = date.isSame(dayjs(), 'day');
    const isCurrentMonth = date.isSame(currentMonth, 'month');
    
    // Get calories for this day from the API data
    const dayCalories = dailyCalories?.[dateStr] || 0;
    
    return (
      <Card
        key={dateStr}
        p="xs"
        withBorder
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-1)' : undefined,
          borderColor: isToday ? 'var(--mantine-color-blue-5)' : undefined,
          borderWidth: isToday ? 2 : 1,
          opacity: isCurrentMonth ? 1 : 0.5,
        }}
        onClick={() => onDateSelect(date.toDate())}
      >
        <Stack gap="xs" align="center">
          <Text
            size="sm"
            fw={isToday ? 700 : 500}
            c={isSelected ? 'blue' : undefined}
          >
            {date.date()}
          </Text>
          
          {dayCalories > 0 && (
            <Badge size="xs" variant="light" color="green">
              {Math.round(dayCalories)} cal
            </Badge>
          )}
          
          {/* Show meal indicators */}
          <Group gap="2px">
            {/* This would show dots or indicators for meals planned */}
            {dayCalories > 0 && (
              <Box
                w={6}
                h={6}
                bg="blue.5"
                style={{ borderRadius: '50%' }}
              />
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = dayjs(dateRange.startDate);
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    
    const weeklyCalories = days.reduce((sum, day) => {
      const dayCalories = dailyCalories?.[day.format('YYYY-MM-DD')] || 0;
      return sum + dayCalories;
    }, 0);

    return (
      <Stack>
        <Group justify="space-between" mb="md">
          <Title order={3}>
            Week of {startOfWeek.format('MMM D, YYYY')}
          </Title>
          <Badge size="lg" variant="light" color="blue">
            Weekly Total: {Math.round(weeklyCalories)} cal
          </Badge>
        </Group>

        <Grid>
          {days.map(day => (
            <Grid.Col key={day.format('YYYY-MM-DD')} span={12 / 7}>
              <Stack align="center" gap="xs">
                <Text size="sm" fw={500} ta="center">
                  {day.format('ddd')}
                </Text>
                {renderDayCell(day)}
              </Stack>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfCalendar = endOfMonth.endOf('week');

    const weeks = [];
    let currentWeekStart = startOfCalendar;

    while (currentWeekStart.isBefore(endOfCalendar) || currentWeekStart.isSame(endOfCalendar)) {
      const week = Array.from({ length: 7 }, (_, i) => 
        currentWeekStart.add(i, 'day')
      );
      weeks.push(week);
      currentWeekStart = currentWeekStart.add(1, 'week');
    }

    return (
      <Stack>
        <Group justify="space-between" mb="md">
          <Group>
            <ActionIcon variant="light" onClick={handlePreviousMonth}>
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Title order={3}>
              {currentMonth.format('MMMM YYYY')}
            </Title>
            <ActionIcon variant="light" onClick={handleNextMonth}>
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Day headers */}
        <Grid mb="xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid.Col key={day} span={12 / 7}>
              <Text size="sm" fw={600} ta="center" c="dimmed">
                {day}
              </Text>
            </Grid.Col>
          ))}
        </Grid>

        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => (
          <Grid key={weekIndex} mb="xs">
            {week.map(day => (
              <Grid.Col key={day.format('YYYY-MM-DD')} span={12 / 7}>
                {renderDayCell(day)}
              </Grid.Col>
            ))}
          </Grid>
        ))}
      </Stack>
    );
  };

  const renderDayView = () => {
    const day = dayjs(selectedDate);
    const dayCalories = dailyCalories?.[day.format('YYYY-MM-DD')] || 0;

    return (
      <Stack align="center">
        <Group>
          <ActionIcon 
            variant="light" 
            onClick={() => onDateSelect(day.subtract(1, 'day').toDate())}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Title order={2}>
            {day.format('dddd, MMMM D, YYYY')}
          </Title>
          <ActionIcon 
            variant="light" 
            onClick={() => onDateSelect(day.add(1, 'day').toDate())}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>

        <Badge size="xl" variant="light" color="blue" mt="md">
          Daily Total: {Math.round(dayCalories)} calories
        </Badge>

        {/* Day could show detailed meal timeline here */}
      </Stack>
    );
  };

  if (isLoading) {
    return (
      <Stack align="center" justify="center" h="100%">
        <Loader />
        <Text>Loading meal plans...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        Failed to load meal plans. Please try again.
      </Alert>
    );
  }

  return (
    <Box h="100%">
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'range' && renderMonthView()}
    </Box>
  );
};
