import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EDPerformanceAssessment from './EDPerformanceAssessment';
import { BrowserRouter } from 'react-router-dom';

// Mock Redux store
const mockStore = configureStore([]);
const store = mockStore({
  auth: {
    isAuthenticated: true,
    user: { name: 'Test User' }
  }
});

// Mock the necessary hooks and components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('EDPerformanceAssessment Component', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EDPerformanceAssessment />
        </BrowserRouter>
      </Provider>
    );
  });

  test('renders the initial introduction', () => {
    expect(screen.getByText(/ED & Performance Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/This tool helps evaluate/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Assessment/i })).toBeInTheDocument();
  });

  test('navigates to survey section when Start Assessment button is clicked', async () => {
    const startButton = screen.getByRole('button', { name: /Start Assessment/i });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    });
  });

  test('displays error when trying to navigate without answering current question', async () => {
    // Start the assessment
    const startButton = screen.getByRole('button', { name: /Start Assessment/i });
    fireEvent.click(startButton);
    
    // Try to move to next question without answering
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please answer the current question/i)).toBeInTheDocument();
    });
  });

  test('allows navigation to next question after answering current question', async () => {
    // Start the assessment
    const startButton = screen.getByRole('button', { name: /Start Assessment/i });
    fireEvent.click(startButton);
    
    // Answer the question
    const option = screen.getByLabelText(/Option 1/i);
    fireEvent.click(option);
    
    // Move to next question
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Question 2/i)).toBeInTheDocument();
    });
  });

  test('displays results after completing all questions', async () => {
    // Start the assessment
    fireEvent.click(screen.getByRole('button', { name: /Start Assessment/i }));
    
    // Complete all questions (simulate)
    // For each question, select an option and click next
    for (let i = 1; i <= 10; i++) { // Assuming 10 questions total
      const option = screen.getByLabelText(/Option 1/i);
      fireEvent.click(option);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
    }
    
    await waitFor(() => {
      expect(screen.getByText(/Assessment Results/i)).toBeInTheDocument();
      expect(screen.getByText(/Score:/i)).toBeInTheDocument();
      expect(screen.getByText(/Recommendations:/i)).toBeInTheDocument();
    });
  });

  test('shows option to save results for authenticated users', async () => {
    // Start and complete the assessment
    fireEvent.click(screen.getByRole('button', { name: /Start Assessment/i }));
    
    // Complete all questions
    for (let i = 1; i <= 10; i++) {
      fireEvent.click(screen.getByLabelText(/Option 1/i));
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    }
    
    await waitFor(() => {
      expect(screen.getByText(/Save Results/i)).toBeInTheDocument();
    });
  });
}); 