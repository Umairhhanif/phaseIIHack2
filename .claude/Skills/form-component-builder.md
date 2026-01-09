# Form Component Builder

**Name:** form-component-builder

**Purpose:** Generate Next.js form components with validation

**Input:** Form fields, validation rules

**Output:** TypeScript component with state management, error handling

**Usage:**
```
@form-component-builder create task form (title, description)
```

## Description

This skill generates complete Next.js form components with the following features:
- React Hook Form integration
- Zod schema validation
- TypeScript type safety
- Error message display
- Loading states
- Submit handling
- API integration
- Accessible form markup
- Success/error feedback

## Example Usage

### Basic Form
```
@form-component-builder create task form (title, description)
```

### Form with Validation Rules
```
@form-component-builder create signup form (email required, password min 8 chars)
```

### Form with Custom Submit
```
@form-component-builder create profile form with avatar upload
```

## Generated Code Structure

The skill will generate:
1. **Form component** with TypeScript
2. **Zod validation schema** for field validation
3. **React Hook Form** setup with useForm
4. **Type definitions** from Zod schema
5. **Error handling** and display
6. **Submit handler** with API integration
7. **Loading states** during submission
8. **Success feedback** after submission
9. **Accessible markup** with proper labels and ARIA

## Integration Points

- **Next.js**: Client component with 'use client'
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **TypeScript**: Inferred types from Zod
- **API Client**: Integration with /lib/api.ts
- **Tailwind CSS**: Styling (optional)

## Example Generated Component

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useState } from 'react';

// Zod validation schema
const taskFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .optional(),
});

// TypeScript type inferred from Zod schema
type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
  initialData?: Partial<TaskFormData>;
}

export default function TaskForm({ onSuccess, initialData }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.tasks.create(data);
      reset();
      onSuccess?.();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title Field */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium mb-1"
        >
          Title *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
```

## Validation Rules Supported

- **Required fields**: `.min(1)` for strings
- **Min/Max length**: `.min(n)` / `.max(n)`
- **Email validation**: `.email()`
- **URL validation**: `.url()`
- **Number ranges**: `.min(n)` / `.max(n)` for numbers
- **Pattern matching**: `.regex(pattern)`
- **Custom validation**: `.refine(fn)`
- **Conditional validation**: `.when()` logic

## Features

- **Type Safety**: Full TypeScript from Zod schema
- **Real-time Validation**: On blur and on submit
- **Error Display**: User-friendly error messages
- **Loading States**: Disable form during submission
- **API Integration**: Automatic API client usage
- **Success Callbacks**: Optional onSuccess handler
- **Initial Values**: Support for edit forms
- **Accessibility**: Proper labels and ARIA attributes
- **Responsive Design**: Mobile-friendly layouts

## Advanced Features

### File Upload Support
```typescript
const schema = z.object({
  avatar: z.instanceof(File)
    .refine(file => file.size <= 5000000, 'Max 5MB')
    .refine(
      file => ['image/jpeg', 'image/png'].includes(file.type),
      'Only JPG/PNG'
    ),
});
```

### Dependent Fields
```typescript
const schema = z.object({
  hasAddress: z.boolean(),
  address: z.string().optional(),
}).refine(
  data => !data.hasAddress || data.address,
  {
    message: 'Address required when checkbox is checked',
    path: ['address'],
  }
);
```

### Array Fields
```typescript
const schema = z.object({
  tags: z.array(z.string()).min(1, 'At least one tag required'),
});
```

## Usage Example

```typescript
// In a page or parent component
import TaskForm from '@/components/TaskForm';
import { useRouter } from 'next/navigation';

export default function NewTaskPage() {
  const router = useRouter();

  return (
    <div>
      <h1>Create New Task</h1>
      <TaskForm
        onSuccess={() => {
          router.push('/tasks');
        }}
      />
    </div>
  );
}
```
