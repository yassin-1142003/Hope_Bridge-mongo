# 🐧 Penguin-Alpha Premium UI Components

## 🎨 Premium Selectors Collection

World-class PrioritySelector and TaskStatusSelector components combining the best of ClickUp, Linear, and Notion design aesthetics.

## ✨ Features

- **🎯 Enterprise Design**: Clean, professional dashboard aesthetic
- **⚡ Micro-interactions**: Smooth hover states and transitions
- **🎨 Color System**: Consistent, semantic color palette
- **⌨️ Keyboard Accessible**: Full keyboard navigation support
- **📱 Responsive**: Mobile-first, touch-friendly
- **🚫 Error States**: Built-in validation support
- **♿ Accessibility**: ARIA compliant and screen reader friendly

## 📦 Components

### PrioritySelector

Beautiful priority selection with visual indicators and color coding.

```tsx
import PrioritySelector from './ui/PrioritySelector';

<PrioritySelector
  value="medium"
  onChange={(value) => console.log('Priority:', value)}
  disabled={false}
  error={false}
/>
```

**Props:**

- `value`: `'low' | 'medium' | 'high' | 'urgent'`
- `onChange`: `(value: string) => void`
- `disabled`: `boolean` (default: `false`)
- `error`: `boolean` (default: `false`)
- `className`: `string` (optional)

**Color System:**

- 🔴 **Low**: Gray (neutral)
- 🟡 **Medium**: Blue (standard)
- 🟠 **High**: Orange (attention)
- 🔴 **Urgent**: Red (critical)

---

### TaskStatusSelector

Elegant status selection with smooth transitions and icons.

```tsx
import TaskStatusSelector from './ui/TaskStatusSelector';

<TaskStatusSelector
  value="in_progress"
  onChange={(value) => console.log('Status:', value)}
  disabled={false}
  error={false}
/>
```

**Props:**

- `value`: `'pending' | 'in_progress' | 'completed' | 'cancelled'`
- `onChange`: `(value: string) => void`
- `disabled`: `boolean` (default: `false`)
- `error`: `boolean` (default: `false`)
- `className`: `string` (optional)

**Color System:**

- ⏳ **Pending**: Gray (waiting)
- 🔵 **In Progress**: Blue (active)
- 🟢 **Completed**: Green (success)
- 🔴 **Cancelled**: Red (terminated)

## 🎯 Usage Examples

### Basic Implementation

```tsx
import { useState } from 'react';
import PrioritySelector from './ui/PrioritySelector';
import TaskStatusSelector from './ui/TaskStatusSelector';

function TaskForm() {
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority Level
        </label>
        <PrioritySelector
          value={priority}
          onChange={setPriority}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Status
        </label>
        <TaskStatusSelector
          value={status}
          onChange={setStatus}
        />
      </div>
    </div>
  );
}
```

### With Validation

```tsx
import { useState } from 'react';
import PrioritySelector from './ui/PrioritySelector';

function TaskFormWithValidation() {
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!priority) {
      setError(true);
      return;
    }
    // Submit form...
  };

  return (
    <div>
      <PrioritySelector
        value={priority}
        onChange={setPriority}
        error={error}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          Priority is required
        </p>
      )}
    </div>
  );
}
```

### Disabled State

```tsx
<PrioritySelector
  value="high"
  onChange={() => {}} // No-op when disabled
  disabled={true}
/>
```

## 🎨 Design System

### Colors
```css
/* Priority Colors */
--priority-low: #6B7280;    /* Gray */
--priority-medium: #3B82F6;  /* Blue */
--priority-high: #F97316;    /* Orange */
--priority-urgent: #EF4444;   /* Red */

/* Status Colors */
--status-pending: #6B7280;      /* Gray */
--status-progress: #3B82F6;     /* Blue */
--status-completed: #10B981;    /* Green */
--status-cancelled: #EF4444;     /* Red */
```

### Typography
- **Font Size**: `14px` (small)
- **Font Weight**: `500` (medium)
- **Line Height**: `1.5`

### Spacing
- **Button Padding**: `8px 16px` (py-2 px-4)
- **Border Radius**: `12px` (rounded-xl)
- **Gap**: `8px` (gap-2)

### Shadows
- **Default**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Hover**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Focus**: `0 0 0 2px rgba(59, 130, 246, 0.5)`

## ⌨️ Keyboard Navigation

All components support full keyboard navigation:

- **Enter/Space**: Open dropdown or select option
- **Escape**: Close dropdown
- **Arrow Up/Down**: Navigate options
- **Tab**: Focus next element

## 🚀 Integration

### With UltimateTaskManager

```tsx
import PrioritySelector from '../ui/PrioritySelector';
import TaskStatusSelector from '../ui/TaskStatusSelector';

// In task detail modal
<TaskStatusSelector
  value={activeTask.status === 'draft' ? 'pending' : 
         activeTask.status === 'active' ? 'in_progress' :
         activeTask.status === 'review' ? 'in_progress' :
         activeTask.status === 'archived' ? 'cancelled' :
         activeTask.status === 'completed' ? 'completed' :
         activeTask.status === 'cancelled' ? 'cancelled' : 'pending'}
  onChange={(newStatus) => {
    // Update task status
    updateTaskStatus(activeTask.id, newStatus);
  }}
/>
```

### With Forms

```tsx
import { useForm } from 'react-hook-form';
import PrioritySelector from '../ui/PrioritySelector';

function CreateTaskForm() {
  const { register, setValue, watch } = useForm();

  return (
    <PrioritySelector
      value={watch('priority')}
      onChange={(value) => setValue('priority', value)}
    />
  );
}
```

## 🎯 Best Practices

1. **Always provide labels** for accessibility
2. **Use error states** for form validation
3. **Implement proper state management** for value changes
4. **Test keyboard navigation** for accessibility compliance
5. **Use consistent spacing** in your layouts

## 🔧 Customization

### Custom Colors

You can customize the color scheme by modifying the component's color arrays:

```tsx
const priorities = [
  {
    value: 'low',
    label: 'Low',
    color: 'text-purple-600',      // Custom color
    bgColor: 'bg-purple-50',       // Custom background
    borderColor: 'border-purple-200', // Custom border
    icon: <Flag className="w-4 h-4" />
  },
  // ... other priorities
];
```

### Custom Icons

```tsx
import { Star } from 'lucide-react';

const priorities = [
  {
    value: 'high',
    label: 'High',
    icon: <Star className="w-4 h-4" /> // Custom icon
  },
  // ... other priorities
];
```

## 🌟 Demo

Run the demo component to see all features in action:

```tsx
import SelectorDemo from './ui/SelectorDemo';

function App() {
  return <SelectorDemo />;
}
```

## 📱 Mobile Responsiveness

Components are optimized for mobile devices with:
- **Touch-friendly targets** (minimum 44px)
- **Responsive dropdowns** that adapt to screen size
- **Smooth animations** optimized for touch interactions

## 🏆 Quality Standards

- ✅ **TypeScript** fully typed
- ✅ **React 18** compatible
- ✅ **Tailwind CSS** optimized
- ✅ **WCAG 2.1 AA** compliant
- ✅ **Screen reader** friendly
- ✅ **High contrast** support

---

**Created by 🐧 Penguin-Alpha - Premium UI Components for Modern Applications**
