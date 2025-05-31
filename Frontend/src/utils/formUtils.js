/**
 * Utility functions for form handling across the application
 */

/**
 * Disables autocomplete on all forms and inputs in the document
 * Should be called after DOM is loaded
 */
export const disableAutocomplete = () => {
  // Disable autocomplete on all forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.setAttribute('autocomplete', 'off');
  });

  // Disable autocomplete on all input fields
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.setAttribute('autocomplete', 'off');
  });

  // Also disable autocomplete on select and textarea elements
  const formElements = document.querySelectorAll('select, textarea');
  formElements.forEach(element => {
    element.setAttribute('autocomplete', 'off');
  });
};

/**
 * Observer to watch for dynamically added forms and inputs
 * and disable autocomplete on them
 */
export const setupAutocompleteObserver = () => {
  // Create a MutationObserver to monitor DOM changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // For each added node that's an Element
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check if the added node is a form or contains forms
            if (node.tagName === 'FORM') {
              node.setAttribute('autocomplete', 'off');
            }
            
            // Find all forms within the added node
            const forms = node.querySelectorAll('form');
            forms.forEach(form => {
              form.setAttribute('autocomplete', 'off');
            });
            
            // Disable autocomplete on inputs, selects, and textareas
            ['input', 'select', 'textarea'].forEach(selector => {
              // Check if node itself is an input/select/textarea
              if (node.tagName === selector.toUpperCase()) {
                node.setAttribute('autocomplete', 'off');
              }
              
              // Check for inputs/selects/textareas within node
              const elements = node.querySelectorAll(selector);
              elements.forEach(element => {
                element.setAttribute('autocomplete', 'off');
              });
            });
          }
        });
      }
    });
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}; 