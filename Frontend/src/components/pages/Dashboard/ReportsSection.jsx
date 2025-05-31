import React, { useState } from 'react';
import HealthReport from './HealthReport';
import './HealthReport.css';

const ReportsSection = ({ user }) => {
  const [activeReport, setActiveReport] = useState('health');

  return (
    <div className="reports-section">
      <div className="reports-header">
        <h2 style={{ color: 'white' }}>Reports & Analytics</h2>
        <p className="reports-description">
          View and export detailed reports about your health data and activity.
        </p>
      </div>

      <div className="reports-tabs">
        <button 
          className={`report-tab-button ${activeReport === 'health' ? 'active' : ''}`}
          onClick={() => setActiveReport('health')}
        >
          Health Activity
        </button>
        {/* Additional report types can be added here in the future */}
      </div>

      <div className="reports-content">
        {activeReport === 'health' && <HealthReport />}
      </div>
    </div>
  );
};

export default ReportsSection;