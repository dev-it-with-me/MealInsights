import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import { ItemsManagementPage } from "@/pages/ingredients";
import { ManageMealsPage } from "@/pages/meals";
import { DietPlanningPage } from "@/pages/diet-planning";
import { ShoppingListPage } from "@/pages/shopping-list";
import { DashboardPage } from "@/pages/home";
import MainLayout from "@/widgets/layout/MainLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "ingredients",
        element: <ItemsManagementPage />,
      },
      {
        path: "meals/manage",
        element: <ManageMealsPage />,
      },
      {
        path: "diet-plan",
        element: <DietPlanningPage />,
      },
      {
        path: "shopping-list",
        element: <ShoppingListPage />,
      },
    ],
  },
]);

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

const AppProviders: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default AppProviders;
