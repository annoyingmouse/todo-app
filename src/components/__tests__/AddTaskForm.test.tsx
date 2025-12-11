import { render, screen, fireEvent } from '@testing-library/react'
import AddTaskForm from '../AddTaskForm'
import { vi } from 'vitest'
describe('AddTaskForm', () => {
  it('renders input and button', () => {
    const onAddMock = vi.fn()
    render(<AddTaskForm onAdd={onAddMock} />)
    expect(screen.getByPlaceholderText(/enter new task/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  it('calls onAdd when form is submitted', () => {
    const onAddMock = vi.fn()
    render(<AddTaskForm onAdd={onAddMock} />)
    const input = screen.getByPlaceholderText(/enter new task/i)
    fireEvent.change(input, { target: { value: 'Test Task' } })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(onAddMock).toHaveBeenCalledWith('Test Task')
  })
})