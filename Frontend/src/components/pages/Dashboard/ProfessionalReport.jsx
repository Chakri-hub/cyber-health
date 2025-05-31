import React from 'react';
import './ProfessionalReport.css';

const ProfessionalReport = ({ user, reportData, timeRange }) => {
  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current date range for report period
  const getDateRangeText = () => {
    const endDate = new Date();
    let startDate;
    
    switch(timeRange) {
      case '24hours':
        startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000));
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      case 'weekly':
        startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      case 'monthly':
        startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      case '3months':
        startDate = new Date(endDate.getTime() - (90 * 24 * 60 * 60 * 1000));
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      default:
        return 'Custom Period';
    }
  };

  // Calculate health status based on available data
  const getHealthStatus = () => {
    if (!reportData) return 'No Data';
    
    // This is a simplified status determination
    // In a real app, you would use more sophisticated logic
    const hasAbnormalData = (
      (reportData.heartRate && reportData.heartRate.some(hr => hr.rate > 100 || hr.rate < 60)) ||
      (reportData.bloodPressure && reportData.bloodPressure.some(bp => bp.systolic > 140 || bp.diastolic > 90)) ||
      (reportData.spo2 && reportData.spo2.some(sp => sp.oxygen_level < 95))
    );
    
    return hasAbnormalData ? 'Needs Attention' : 'On Track';
  };

  // Calculate completion status of health monitoring tasks
  const getCompletionTasks = () => {
    const tasks = [
      {
        name: 'Heart Rate Monitoring',
        status: reportData?.heartRate?.length > 0 ? 'Complete' : 'Not Started'
      },
      {
        name: 'Blood Pressure Tracking',
        status: reportData?.bloodPressure?.length > 0 ? 'Complete' : 'Not Started'
      },
      {
        name: 'Sleep Analysis',
        status: reportData?.sleep?.length > 0 ? 'In Progress' : 'Not Started'
      }
    ];
    
    return tasks;
  };

  // Generate activity highlights based on available data
  const getActivityHighlights = () => {
    const highlights = [];
    
    if (reportData?.heartRate?.length > 0) {
      highlights.push('Recorded heart rate measurements regularly');
    }
    
    if (reportData?.bloodPressure?.length > 0) {
      highlights.push('Tracked blood pressure consistently');
    }
    
    if (reportData?.spo2?.length > 0) {
      highlights.push('Monitored oxygen saturation levels');
    }
    
    if (reportData?.sleep?.length > 0) {
      highlights.push('Tracked sleep patterns and quality');
    }
    
    if (reportData?.mood?.length > 0) {
      highlights.push('Recorded mood and emotional wellbeing');
    }
    
    if (highlights.length === 0) {
      highlights.push('No activity recorded in this period');
    }
    
    return highlights;
  };

  // Generate to-do items based on missing or incomplete data
  const getTodoItems = () => {
    const todos = [];
    
    if (!reportData?.heartRate?.length) {
      todos.push('Start recording heart rate measurements');
    }
    
    if (!reportData?.bloodPressure?.length) {
      todos.push('Begin tracking blood pressure');
    }
    
    if (!reportData?.sleep?.length) {
      todos.push('Set up sleep tracking');
    }
    
    if (reportData?.heartRate?.length < 3) {
      todos.push('Increase frequency of heart rate measurements');
    }
    
    if (todos.length === 0) {
      todos.push('Continue current health monitoring routine');
      todos.push('Review health metrics weekly');
      todos.push('Update health goals as needed');
    }
    
    return todos;
  };

  return (
    <div className="professional-report">
      <div className="professional-report-header">
        <h1>Cyber Health Status Report</h1>
        <p>This is the Health Status Report for your Cyber Health monitoring. It covers all aspects of your health tracking, including vital signs, sleep patterns, and overall wellbeing.</p>
      </div>
      
      <div className="professional-report-content">
        <table className="project-info-table">
          <tbody>
            <tr>
              <td>User Name</td>
              <td>{user?.firstName} {user?.lastName}</td>
            </tr>
            <tr>
              <td>Report Period</td>
              <td>{getDateRangeText()}</td>
            </tr>
            <tr>
              <td>Health Status</td>
              <td>{getHealthStatus()}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="status-section">
          <div className="completion-status">
            <h3>Health Monitoring Status</h3>
            {getCompletionTasks().map((task, index) => (
              <div key={index} className="task-item">
                <span className="task-name">{task.name}:</span>
                <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="two-column-section">
          <div>
            <h3>Weekly Activity Highlights</h3>
            <ul className="activity-list">
              {getActivityHighlights().map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3>To-Do's for Next Week</h3>
            <ul className="todo-list">
              {getTodoItems().map((todo, index) => (
                <li key={index}>{todo}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="notes-section">
          <h3>Notes</h3>
          <p>This report is generated based on your health data recorded in the Cyber Health platform.</p>
          <p>For best results, consistently track your health metrics and follow the recommended monitoring schedule.</p>
        </div>
      </div>
      
      <div className="professional-report-footer">
        <p>Generated on: {new Date().toLocaleString()} | Cyber Health</p>
      </div>
    </div>
  );
};

export default ProfessionalReport;