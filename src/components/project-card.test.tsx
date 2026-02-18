import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from './project-card'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock date-fns format
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Feb 18, 2026'),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  DollarSign: () => <span data-testid="dollar-icon">DollarSign</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  MoreVertical: () => <span data-testid="more-icon">MoreVertical</span>,
}))

describe('ProjectCard', () => {
  const mockProject = {
    id: 'test-id-123',
    name: 'Test Project',
    description: 'A test project description',
    start_date: new Date('2026-02-01'),
    end_date: new Date('2026-02-28'),
    estimated_budget: 5000,
    status: 'active' as const,
    created_at: new Date('2026-02-18'),
    updated_at: new Date('2026-02-18'),
  }

  const mockOnEdit = vi.fn()
  const mockOnArchive = vi.fn()
  const mockOnDelete = vi.fn()

  it('renders project name and description', () => {
    render(<ProjectCard project={mockProject} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project description')).toBeInTheDocument()
  })

  it('renders status badge correctly', () => {
    render(<ProjectCard project={mockProject} />)

    const activeBadge = screen.getByText('Active')
    expect(activeBadge).toBeInTheDocument()
    expect(activeBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders project details correctly', () => {
    render(<ProjectCard project={mockProject} />)

    // Check for icons
    expect(screen.getAllByTestId('calendar-icon').length).toBeGreaterThan(0)
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument()

    // Check for date displays (mocked format returns 'Feb 18, 2026')
    expect(screen.getAllByText('Feb 18, 2026').length).toBeGreaterThan(0)
  })

  it('calculates and displays duration correctly', () => {
    const projectWith27DayDuration = {
      ...mockProject,
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-02-28'),
    }

    render(<ProjectCard project={projectWith27DayDuration} />)

    // Duration should be 27 days (28 - 1 = 27)
    // The component calculates using Math.ceil
    expect(screen.getByText('27 days')).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
    render(<ProjectCard project={mockProject} />)

    // Default Intl.NumberFormat for USD with no fractions
    expect(screen.getByText('$5,000')).toBeInTheDocument()
  })

  it('shows action dropdown when MoreVertical icon is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )

    const moreButton = screen.getByTestId('more-icon')
    fireEvent.click(moreButton)

    expect(screen.getByText('View Details')).toBeInTheDocument()
    expect(screen.getByText('Edit Project')).toBeInTheDocument()
    expect(screen.getByText('Archive Project')).toBeInTheDocument()
    expect(screen.getByText('Delete Project')).toBeInTheDocument()
  })

  it('calls onEdit when Edit Project is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={mockOnEdit}
      />
    )

    const moreButton = screen.getByTestId('more-icon')
    fireEvent.click(moreButton)

    const editButton = screen.getByText('Edit Project')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockProject)
  })

  it('calls onArchive when Archive Project is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onArchive={mockOnArchive}
      />
    )

    const moreButton = screen.getByTestId('more-icon')
    fireEvent.click(moreButton)

    const archiveButton = screen.getByText('Archive Project')
    fireEvent.click(archiveButton)

    expect(mockOnArchive).toHaveBeenCalledWith(mockProject)
  })

  it('calls onDelete when Delete Project is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onDelete={mockOnDelete}
      />
    )

    const moreButton = screen.getByTestId('more-icon')
    fireEvent.click(moreButton)

    const deleteButton = screen.getByText('Delete Project')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockProject)
  })

  it('does not show Archive option for archived projects', () => {
    const archivedProject = {
      ...mockProject,
      status: 'archived' as const,
    }

    render(
      <ProjectCard
        project={archivedProject}
        onArchive={mockOnArchive}
      />
    )

    const moreButton = screen.getByTestId('more-icon')
    fireEvent.click(moreButton)

    expect(screen.queryByText('Archive Project')).not.toBeInTheDocument()
  })

  it('renders correct badge colors for different statuses', () => {
    const { rerender } = render(<ProjectCard project={{ ...mockProject, status: 'active' }} />)
    expect(screen.getByText('Active')).toHaveClass('bg-green-100', 'text-green-800')

    rerender(<ProjectCard project={{ ...mockProject, status: 'completed' }} />)
    expect(screen.getByText('Completed')).toHaveClass('bg-blue-100', 'text-blue-800')

    rerender(<ProjectCard project={{ ...mockProject, status: 'archived' }} />)
    expect(screen.getByText('Archived')).toHaveClass('bg-gray-100', 'text-gray-800')
  })
})