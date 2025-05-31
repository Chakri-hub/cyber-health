/**
 * TableResizer.js
 * This module provides column resizing functionality for tables
 */

const TableResizer = {
  /**
   * Initialize the table resizing functionality
   * @param {string} tableSelector - CSS selector for the table
   */
  init: function(tableSelector = '.user-table') {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupResizableTable(tableSelector));
    } else {
      this.setupResizableTable(tableSelector);
    }
  },

  /**
   * Set up the resizable functionality for the table
   * @param {string} tableSelector - CSS selector for the table
   */
  setupResizableTable: function(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const headers = table.querySelectorAll('th');
    const tableRect = table.getBoundingClientRect();
    
    // Store original widths to maintain minimum width
    const originalWidths = Array.from(headers).map(header => {
      const width = header.offsetWidth;
      header.style.width = `${width}px`;
      return width;
    });

    headers.forEach((header, index) => {
      const resizer = document.createElement('div');
      resizer.classList.add('column-resizer');
      header.appendChild(resizer);
      
      let startX, startWidth, tableWidth;
      
      const startResize = (e) => {
        startX = e.pageX || e.touches?.[0].pageX;
        startWidth = header.offsetWidth;
        tableWidth = table.offsetWidth;
        
        // Add resizing class to indicate active resizing
        header.classList.add('resizing');
        document.body.classList.add('column-resizing');
        
        // Add event listeners for mouse/touch move and up/end
        document.addEventListener('mousemove', resize);
        document.addEventListener('touchmove', resize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
        
        // Prevent text selection during resize
        e.preventDefault();
      };
      
      const resize = (e) => {
        const currentX = e.pageX || e.touches?.[0].pageX;
        if (!currentX) return;
        
        const diffX = currentX - startX;
        const newWidth = Math.max(startWidth + diffX, originalWidths[index] * 0.5);
        
        // Update the width of the current header
        header.style.width = `${newWidth}px`;
        
        // Store the width in localStorage for persistence
        try {
          const columnWidths = JSON.parse(localStorage.getItem('tableColumnWidths') || '{}');
          columnWidths[`col-${index}`] = newWidth;
          localStorage.setItem('tableColumnWidths', JSON.stringify(columnWidths));
        } catch (err) {
          console.error('Error saving column width to localStorage:', err);
        }
      };
      
      const stopResize = () => {
        header.classList.remove('resizing');
        document.body.classList.remove('column-resizing');
        
        // Remove event listeners
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('touchmove', resize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchend', stopResize);
      };
      
      // Add event listeners for mouse/touch down
      resizer.addEventListener('mousedown', startResize);
      resizer.addEventListener('touchstart', startResize);
    });
    
    // Restore column widths from localStorage if available
    try {
      const columnWidths = JSON.parse(localStorage.getItem('tableColumnWidths') || '{}');
      Object.entries(columnWidths).forEach(([colKey, width]) => {
        const index = parseInt(colKey.replace('col-', ''));
        if (!isNaN(index) && headers[index]) {
          headers[index].style.width = `${width}px`;
        }
      });
    } catch (err) {
      console.error('Error restoring column widths from localStorage:', err);
    }
  },

  /**
   * Reset all column widths to their default values
   * @param {string} tableSelector - CSS selector for the table
   */
  resetColumnWidths: function(tableSelector = '.user-table') {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const headers = table.querySelectorAll('th');
    
    // Remove all inline width styles
    headers.forEach(header => {
      header.style.width = '';
    });
    
    // Clear stored widths from localStorage
    try {
      localStorage.removeItem('tableColumnWidths');
    } catch (err) {
      console.error('Error clearing column widths from localStorage:', err);
    }
  }
};

export default TableResizer;