import { Button, TextInput, Text, Paper, Title } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';

// 1. Define your Zod schema for validation
const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Infer the TypeScript type from the Zod schema
type UserFormData = z.infer<typeof userSchema>;

function App() {
  // 2. Initialize React Hook Form with Zod resolver
  const {
    register, // Function to register inputs
    handleSubmit, // Function to handle form submission (with validation)
    formState: { errors }, // Object containing validation errors
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema), // Use Zod for validation
  });

  // 3. Define the form submission handler
  const onSubmit = (data: UserFormData) => {
    console.log('Form data submitted:', data);
    notifications.show({
      title: 'Form Submitted Successfully!',
      message: `Welcome, ${data.username}!`,
      color: 'teal',
    });
    // In a real app, you'd send this data to an API
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Paper shadow="xl" p="xl" withBorder className="w-full max-w-md bg-white rounded-lg">
        <Title order={2} ta="center" mb="lg" className="text-blue-600">
          Register
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            mb="md"
            error={errors.username?.message} // Display Mantine error
            {...register('username')} // Connect input to React Hook Form
          />

          <TextInput
            label="Email"
            placeholder="Your email"
            mb="md"
            error={errors.email?.message} // Display Mantine error
            {...register('email')} // Connect input to React Hook Form
          />

          <TextInput
            label="Password"
            placeholder="Your password"
            type="password"
            mb="xl"
            error={errors.password?.message} // Display Mantine error
            {...register('password')} // Connect input to React Hook Form
          />

          <Button type="submit" fullWidth>
            Submit
          </Button>

          {/* Example of Tailwind text for basic content */}
          <Text size="sm" ta="center" mt="md" className="text-gray-500">
            This form uses Mantine for UI, Tailwind for layout/background, and Zod for validation.
          </Text>
        </form>
      </Paper>
    </div>
  );
}

export default App;