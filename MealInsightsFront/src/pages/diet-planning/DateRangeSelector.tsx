import { useState } from 'react';
import {
  Group,
  SegmentedControl,
  Button,
  Stack,
  Text,
} from '@mantine/core';
import { DatePickerInput, type DateValue } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { ViewMode } from './DietPlanningPage';

export interface DateRangeSelectorProps {
  viewMode: ViewMode;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onViewModeChange: (mode: ViewMode) => void;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export const DateRangeSelector = ({
  viewMode,
  dateRange,
  onViewModeChange,
  onDateRangeChange,
}: DateRangeSelectorProps) => {
  const [tempStartDate, setTempStartDate] = useState<DateValue>(dateRange.startDate);
  const [tempEndDate, setTempEndDate] = useState<DateValue>(dateRange.endDate);

  const handleViewModeChange = (value: string) => {
    const mode = value as ViewMode;
    onViewModeChange(mode);

    // Auto-adjust date ranges based on view mode
    const today = new Date();
    if (mode === 'day') {
      onDateRangeChange(today, today);
    } else if (mode === 'week') {
      const startOfWeek = dayjs(today).startOf('week').toDate();
      const endOfWeek = dayjs(today).endOf('week').toDate();
      onDateRangeChange(startOfWeek, endOfWeek);
    }
    // For 'range' mode, keep current selection
  };

  const handleApplyDateRange = () => {
    if (tempStartDate && tempEndDate) {
      // Convert DateValue to Date if needed
      const startDate = tempStartDate instanceof Date ? tempStartDate : new Date(tempStartDate);
      const endDate = tempEndDate instanceof Date ? tempEndDate : new Date(tempEndDate);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleQuickSelect = (type: 'today' | 'thisWeek' | 'thisMonth') => {
    const today = dayjs();
    let start: Date, end: Date;

    switch (type) {
      case 'today':
        start = end = today.toDate();
        onViewModeChange('day');
        break;
      case 'thisWeek':
        start = today.startOf('week').toDate();
        end = today.endOf('week').toDate();
        onViewModeChange('week');
        break;
      case 'thisMonth':
        start = today.startOf('month').toDate();
        end = today.endOf('month').toDate();
        onViewModeChange('range');
        break;
    }

    setTempStartDate(start);
    setTempEndDate(end);
    onDateRangeChange(start, end);
  };

  return (
    <Stack gap="md">
      {/* View Mode Selector */}
      <Group>
        <Text size="sm" fw={500}>View:</Text>
        <SegmentedControl
          value={viewMode}
          onChange={handleViewModeChange}
          data={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Range', value: 'range' },
          ]}
        />
      </Group>

      {/* Quick Select Buttons */}
      <Group>
        <Text size="sm" fw={500}>Quick Select:</Text>
        <Button 
          size="xs" 
          variant="light" 
          onClick={() => handleQuickSelect('today')}
        >
          Today
        </Button>
        <Button 
          size="xs" 
          variant="light" 
          onClick={() => handleQuickSelect('thisWeek')}
        >
          This Week
        </Button>
        <Button 
          size="xs" 
          variant="light" 
          onClick={() => handleQuickSelect('thisMonth')}
        >
          This Month
        </Button>
      </Group>

      {/* Custom Date Range (shown for range mode) */}
      {viewMode === 'range' && (
        <Group>
          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
            value={tempStartDate}
            onChange={setTempStartDate}
            leftSection={<IconCalendar size={16} />}
            clearable
            size="sm"
          />
          <DatePickerInput
            label="End Date"
            placeholder="Select end date"
            value={tempEndDate}
            onChange={setTempEndDate}
            leftSection={<IconCalendar size={16} />}
            clearable
            size="sm"
            minDate={tempStartDate || undefined}
          />
          <Button
            onClick={handleApplyDateRange}
            disabled={!tempStartDate || !tempEndDate}
            size="sm"
            mt="auto"
          >
            Apply Range
          </Button>
        </Group>
      )}

      {/* Current Range Display */}
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          Viewing: {dayjs(dateRange.startDate).format('MMM D')} 
          {!dayjs(dateRange.startDate).isSame(dateRange.endDate, 'day') && 
            ` - ${dayjs(dateRange.endDate).format('MMM D, YYYY')}`
          }
          {dayjs(dateRange.startDate).isSame(dateRange.endDate, 'day') && 
            dayjs(dateRange.startDate).format(', YYYY')
          }
        </Text>
      </Group>
    </Stack>
  );
};
