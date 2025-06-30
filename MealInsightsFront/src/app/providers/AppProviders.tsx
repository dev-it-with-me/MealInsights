import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Pages
import { ItemsManagementPage } from '@/pages/ingredients';
import { ManageMealsPage } from '@/pages/meals';
import MainLayout from '@/widgets/layout/MainLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <div>Welcome to MealInsights</div>, // Temporary home page
      },
      {
        path: 'ingredients',
        element: <ItemsManagementPage />,
      },
      {
        path: 'meals/manage',
        element: <ManageMealsPage />,
      },
    ],
  },
]);

const AppProviders: React.FC = () => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications position="top-right" />
        <RouterProvider router={router} />
      </ModalsProvider>
    </MantineProvider>
  );
};

export default AppProviders;
