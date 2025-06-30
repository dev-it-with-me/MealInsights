import { useState } from 'react';
import { Container, Grid, Paper, Title, Group, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { CalendarView } from './CalendarView';
import { DateRangeSelector } from './DateRangeSelector';
import { MealAssignmentPanel } from './MealAssignmentPanel';

export type ViewMode = 'day' | 'week' | 'range';

export interface DietPlanningPageProps {}

export const DietPlanningPage = ({}: DietPlanningPageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('week').toDate(),
    endDate: dayjs().endOf('week').toDate(),
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    
    // Update date range based on view mode
    const today = dayjs();
    if (mode === 'day') {
      setDateRange({
        startDate: selectedDate,
        endDate: selectedDate,
      });
    } else if (mode === 'week') {
      setDateRange({
        startDate: today.startOf('week').toDate(),
        endDate: today.endOf('week').toDate(),
      });
    }
    // For 'range' mode, keep current selection
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    setSelectedDate(startDate);
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={1} size="h2">
          Diet Planning
        </Title>
        <Group gap="xs">
          <IconCalendar size={16} />
          <Text size="sm">
            {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
          </Text>
        </Group>
      </Group>

      {/* Date Range Selector */}
      <Paper p="md" withBorder mb="lg">
        <DateRangeSelector
          viewMode={viewMode}
          dateRange={dateRange}
          onViewModeChange={handleViewModeChange}
          onDateRangeChange={handleDateRangeChange}
        />
      </Paper>

      <Grid>
        {/* Left Panel - Calendar View */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="md" withBorder h="600px" style={{ overflow: 'hidden' }}>
            <CalendarView
              viewMode={viewMode}
              selectedDate={selectedDate}
              dateRange={dateRange}
              onDateSelect={setSelectedDate}
            />
          </Paper>
        </Grid.Col>

        {/* Right Panel - Meal Assignment */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder h="600px" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
              <MealAssignmentPanel
                selectedDate={selectedDate}
                onMealAssigned={() => {
                  // Meal assignment completed - could trigger calendar refresh if needed
                  console.log('Meal assigned successfully');
                }}
              />
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
