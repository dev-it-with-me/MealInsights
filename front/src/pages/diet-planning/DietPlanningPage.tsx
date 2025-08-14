import { useState } from "react";
import { Container, Grid, Paper, Text } from "@/shared/ui-kit";
import { IconCalendar } from "@tabler/icons-react";
import { PageHeader } from "@/shared/ui";
import dayjs from "dayjs";
import { CalendarView } from "./CalendarView";
import { DateRangeSelector } from "./DateRangeSelector";
import { MealAssignmentPanel } from "./MealAssignmentPanel";

export type ViewMode = "day" | "week" | "range";

export interface DietPlanningPageProps {}

export const DietPlanningPage = ({}: DietPlanningPageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("week").toDate(),
    endDate: dayjs().endOf("week").toDate(),
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);

    // Update date range based on view mode
    const today = dayjs();
    if (mode === "day") {
      setDateRange({
        startDate: selectedDate,
        endDate: selectedDate,
      });
    } else if (mode === "week") {
      setDateRange({
        startDate: today.startOf("week").toDate(),
        endDate: today.endOf("week").toDate(),
      });
    }
    // For 'range' mode, keep current selection
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    setSelectedDate(startDate);
  };

  return (
    <div>
      <Container size="xl">
        <PageHeader
          icon={IconCalendar}
          title="Diet Planning"
          description="Plan your meals, manage your diet, and track your nutrition"
          rightContent={
            <Text size="sm" style={{ color: "var(--color-surface-300)" }}>
              {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
            </Text>
          }
        />

        {/* Date Range Selector */}
        <Paper
          p="lg"
          mb="lg"
          style={{
            backgroundColor: "var(--color-surface-900)",
            border: "1px solid var(--color-surface-800)",
            borderRadius: "12px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
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
            <Paper
              p="lg"
              h="600px"
              style={{
                overflow: "hidden",
                backgroundColor: "var(--color-surface-900)",
                border: "1px solid var(--color-surface-800)",
                borderRadius: "12px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
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
            <Paper
              h="600px"
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--color-surface-900)",
                border: "1px solid var(--color-surface-800)",
                borderRadius: "12px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
                <MealAssignmentPanel
                  selectedDate={selectedDate}
                  onMealAssigned={() => {
                    // Meal assignment completed - could trigger calendar refresh if needed
                    console.log("Meal assigned successfully");
                  }}
                />
              </div>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
};
