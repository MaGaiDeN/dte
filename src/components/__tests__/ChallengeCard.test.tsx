import { render, screen, fireEvent } from '@testing-library/react';
import { ChallengeCard } from '../ChallengeCard';
import '@testing-library/jest-dom';

describe('ChallengeCard', () => {
  const mockChallenge = {
    id: '1',
    title: 'Test Challenge',
    description: 'Test Description',
    name: 'Test Name',
    type: 'meditation' as const,
    days: 30,
    startDate: new Date().toISOString().split('T')[0], // Today
    progress: 0,
    isActive: true
  };

  const mockOnUpdateProgress = jest.fn();

  it('should render all days with day 1 being clickable', () => {
    render(
      <ChallengeCard 
        challenge={mockChallenge}
        onUpdateProgress={mockOnUpdateProgress}
      />
    );

    // Find the button for day 1
    const day1Button = screen.getByRole('button', { name: /^1$/ });
    
    // Check that day 1 is not disabled
    expect(day1Button).not.toHaveClass('cursor-not-allowed');
    expect(day1Button).not.toHaveClass('pointer-events-none');
    
    // Verify it's clickable
    fireEvent.click(day1Button);
    expect(day1Button).not.toBeDisabled();
  });
});
