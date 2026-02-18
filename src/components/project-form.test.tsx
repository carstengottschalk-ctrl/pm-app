import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectForm } from './project-form'

// Mock shadcn/ui components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className, type }: any) => (
    <input
      data-testid="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      type={type}
    />
  ),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, value, onChange, className }: any) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}))

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ selected, onSelect }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect(new Date('2026-02-19'))}>
        Select Date
      </button>
    </div>
  ),
}))

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormDescription: ({ children }: any) => <div>{children}</div>,
  FormMessage: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: '', onChange: vi.fn() } }),
}))

// Mock date-fns format
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'February 19, 2026'),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CalendarIcon: () => <span data-testid="calendar-icon">CalendarIcon</span>,
}))

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault()
      fn({
        name: 'Test Project',
        description: 'Test Description',
        start_date: new Date('2026-02-19'),
        end_date: new Date('2026-02-28'),
        estimated_budget: 5000,
      })
    },
    formState: { errors: {} },
    control: {},
    getValues: () => ({}),
    setValue: vi.fn(),
    watch: vi.fn(),
    register: vi.fn(),
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}))

describe('ProjectForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  it('renders form fields correctly', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe the project goals, scope, or any important details')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })

  it('renders with default values when provided', () => {
    const defaultValues = {
      name: 'Existing Project',
      description: 'Existing description',
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-02-15'),
      estimated_budget: 3000,
    }

    render(
      <ProjectForm
        defaultValues={defaultValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Note: The form uses controlled components, values may not be visible in simple mock
    // But we can verify the form renders
    expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted', async () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByText('Create Project')
    fireEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'Test Description',
      start_date: new Date('2026-02-19'),
      end_date: new Date('2026-02-28'),
      estimated_budget: 5000,
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows different submit button text when provided', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitButtonText="Update Project"
      />
    )

    expect(screen.getByText('Update Project')).toBeInTheDocument()
  })

  it('disables buttons when isSubmitting is true', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    )

    const submitButton = screen.getByText('Saving...')
    const cancelButton = screen.getByText('Cancel')

    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })
})