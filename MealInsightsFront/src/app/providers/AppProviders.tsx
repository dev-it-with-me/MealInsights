import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Pages
import { ItemsManagementPage } from '@/pages/ingredients';
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
    ],
  },
]);

const AppProviders: React.FC = () => {
  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <RouterProvider router={router} />
    </MantineProvider>
  );
};

export default AppProviders;
