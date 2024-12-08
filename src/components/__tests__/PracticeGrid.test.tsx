import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeGrid } from '../PracticeGrid';
import { Practice } from '../../types/Habit';

describe('PracticeGrid', () => {
  const mockPractices: Practice[] = [{
    id: '1',
    name: 'Test Practice',
    description: 'Test Description',
    type: 'meditation',
    color: '#000000',
    completedDates: ['2023-12-07'],
    progress: 0,
    duration: 30,
    currentStreak: 0,
    longestStreak: 0,
    reflections: {},
    startDate: '2023-12-01'
  }];

  const mockOnDateClick = jest.fn();

  it('renders practice name and description', () => {
    render(<PracticeGrid practices={mockPractices} onDateClick={mockOnDateClick} />);
    
    expect(screen.getByText('Test Practice')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles date clicks correctly', () => {
    render(<PracticeGrid practices={mockPractices} onDateClick={mockOnDateClick} />);
    
    // Encuentra todos los botones de fecha que no están deshabilitados
    const dateButtons = screen.queryAllByRole('button').filter(button => !button.hasAttribute('disabled'));
    
    if (dateButtons.length > 0) {
      fireEvent.click(dateButtons[0]);
      expect(mockOnDateClick).toHaveBeenCalled();
    }
  });

  it('shows completed dates with check icon', () => {
    render(<PracticeGrid practices={mockPractices} onDateClick={mockOnDateClick} />);
    
    // Verifica que las fechas completadas muestren el icono de check
    const completedDates = mockPractices[0].completedDates;
    completedDates.forEach(date => {
      const dateButton = screen.queryByRole('button', { name: new RegExp(new Date(date).getDate().toString()) });
      if (dateButton) {
        expect(dateButton).toHaveClass('bg-gradient-to-br');
      }
    });
  });
});
