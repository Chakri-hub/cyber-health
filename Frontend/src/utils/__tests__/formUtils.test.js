import { disableAutocomplete, setupAutocompleteObserver } from '../formUtils';

// Mock document functions
const setupMockDOM = () => {
  // Create mock elements
  const mockForm = document.createElement('form');
  const mockInput = document.createElement('input');
  const mockSelect = document.createElement('select');
  const mockTextarea = document.createElement('textarea');
  
  // Append elements to body
  document.body.appendChild(mockForm);
  document.body.appendChild(mockInput);
  document.body.appendChild(mockSelect);
  document.body.appendChild(mockTextarea);
  
  return {
    mockForm,
    mockInput,
    mockSelect,
    mockTextarea
  };
};

describe('Form Utilities', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
  });
  
  describe('disableAutocomplete', () => {
    it('should set autocomplete="off" on all forms', () => {
      const { mockForm } = setupMockDOM();
      
      // Run the function
      disableAutocomplete();
      
      // Check if autocomplete attribute is set to "off"
      expect(mockForm.getAttribute('autocomplete')).toBe('off');
    });
    
    it('should set autocomplete="off" on all input fields', () => {
      const { mockInput } = setupMockDOM();
      
      // Run the function
      disableAutocomplete();
      
      // Check if autocomplete attribute is set to "off"
      expect(mockInput.getAttribute('autocomplete')).toBe('off');
    });
    
    it('should set autocomplete="off" on all select and textarea elements', () => {
      const { mockSelect, mockTextarea } = setupMockDOM();
      
      // Run the function
      disableAutocomplete();
      
      // Check if autocomplete attribute is set to "off"
      expect(mockSelect.getAttribute('autocomplete')).toBe('off');
      expect(mockTextarea.getAttribute('autocomplete')).toBe('off');
    });
  });
  
  describe('setupAutocompleteObserver', () => {
    it('should set autocomplete="off" on dynamically added form elements', () => {
      // Setup observer
      const observer = setupAutocompleteObserver();
      
      // Create and add a new form element
      const newForm = document.createElement('form');
      document.body.appendChild(newForm);
      
      // Create and add a new input element
      const newInput = document.createElement('input');
      document.body.appendChild(newInput);
      
      // Wait for MutationObserver to process
      setTimeout(() => {
        // Check if autocomplete attribute is set to "off"
        expect(newForm.getAttribute('autocomplete')).toBe('off');
        expect(newInput.getAttribute('autocomplete')).toBe('off');
        
        // Disconnect observer
        observer.disconnect();
      }, 0);
    });
  });
}); 