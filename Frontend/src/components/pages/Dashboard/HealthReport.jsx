import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useSelector } from 'react-redux';
import { healthService } from '../../../services/healthService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Dashboard.css';
import ProfessionalReport from './ProfessionalReport';
import './ProfessionalReport.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const HealthReport = () => {
  const { user } = useSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState('24hours');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const reportRef = React.useRef(null);

  // Define time ranges in milliseconds
  const timeRanges = {
    '24hours': 24 * 60 * 60 * 1000,
    'weekly': 7 * 24 * 60 * 60 * 1000,
    'monthly': 30 * 24 * 60 * 60 * 1000,
    '3months': 90 * 24 * 60 * 60 * 1000
  };

  // Fetch health data based on selected time range
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!user || !user.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - timeRanges[timeRange]);
        
        // Fetch data from different health services
        const [heartRateData, bloodPressureData, spo2Data, temperatureData, weightData, moodData, sleepData] = await Promise.all([
          healthService.getHeartRateHistory(user.id),
          healthService.getBloodPressureHistory(user.id),
          healthService.getSpO2History(user.id),
          healthService.getTemperatureHistory(user.id),
          healthService.getWeightHistory(user.id),
          healthService.getMoodHistory(user.id),
          healthService.getSleepHistory(user.id)
        ]);
        
        // Filter data based on time range
        const filterByTimeRange = (data, dateField = 'recorded_at') => {
          if (!data) return [];
          
          // Handle both array format and {records: [...]} format
          const recordsArray = Array.isArray(data) ? data : (data.records || []);
          
          return recordsArray.filter(record => {
            const recordDate = new Date(record[dateField]);
            return recordDate >= startDate && recordDate <= endDate;
          });
        };
        
        // Process and organize the data
        const processedData = {
          heartRate: filterByTimeRange(heartRateData),
          bloodPressure: filterByTimeRange(bloodPressureData),
          spo2: filterByTimeRange(spo2Data),
          temperature: filterByTimeRange(temperatureData),
          weight: filterByTimeRange(weightData),
          mood: filterByTimeRange(moodData),
          sleep: filterByTimeRange(sleepData),
          startDate,
          endDate
        };
        
        setReportData(processedData);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to fetch health data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHealthData();
  }, [user, timeRange]);

  // Generate chart data for heart rate
  const generateHeartRateChartData = () => {
    if (!reportData || !reportData.heartRate || reportData.heartRate.length === 0) {
      return null;
    }
    
    const sortedData = [...reportData.heartRate].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    return {
      labels: sortedData.map(record => new Date(record.recorded_at).toLocaleDateString()),
      datasets: [
        {
          label: 'Heart Rate (BPM)',
          data: sortedData.map(record => record.rate),
          borderColor: '#00f7ff',
          backgroundColor: 'rgba(0, 247, 255, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Generate chart data for blood pressure
  const generateBloodPressureChartData = () => {
    if (!reportData || !reportData.bloodPressure || reportData.bloodPressure.length === 0) {
      return null;
    }
    
    const sortedData = [...reportData.bloodPressure].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    return {
      labels: sortedData.map(record => new Date(record.recorded_at).toLocaleDateString()),
      datasets: [
        {
          label: 'Systolic',
          data: sortedData.map(record => record.systolic),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.2)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Diastolic',
          data: sortedData.map(record => record.diastolic),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
  };

  // Generate chart data for SpO2
  const generateSpO2ChartData = () => {
    if (!reportData || !reportData.spo2 || reportData.spo2.length === 0) {
      return null;
    }
    
    const sortedData = [...reportData.spo2].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    return {
      labels: sortedData.map(record => new Date(record.recorded_at).toLocaleDateString()),
      datasets: [
        {
          label: 'Oxygen Saturation (%)',
          data: sortedData.map(record => record.oxygen_level),
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Generate chart data for mood distribution
  const generateMoodDistributionData = () => {
    if (!reportData || !reportData.mood || reportData.mood.length === 0) {
      return null;
    }
    
    // Count occurrences of each mood level
    const moodCounts = {};
    const moodLabels = {
      1: 'Very Bad',
      2: 'Bad',
      3: 'Neutral',
      4: 'Good',
      5: 'Excellent'
    };
    
    reportData.mood.forEach(record => {
      const moodLevel = record.mood;
      moodCounts[moodLevel] = (moodCounts[moodLevel] || 0) + 1;
    });
    
    return {
      labels: Object.keys(moodCounts).map(level => moodLabels[level] || `Level ${level}`),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: [
            'rgba(231, 76, 60, 0.7)',   // Very Bad - Red
            'rgba(230, 126, 34, 0.7)',  // Bad - Orange
            'rgba(241, 196, 15, 0.7)',  // Neutral - Yellow
            'rgba(46, 204, 113, 0.7)',  // Good - Green
            'rgba(52, 152, 219, 0.7)',  // Excellent - Blue
          ],
          borderColor: [
            'rgba(231, 76, 60, 1)',
            'rgba(230, 126, 34, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(52, 152, 219, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate chart data for sleep quality
  const generateSleepQualityData = () => {
    if (!reportData || !reportData.sleep || reportData.sleep.length === 0) {
      return null;
    }
    
    const sortedData = [...reportData.sleep].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    return {
      labels: sortedData.map(record => new Date(record.recorded_at).toLocaleDateString()),
      datasets: [
        {
          label: 'Hours Slept',
          data: sortedData.map(record => record.hours_slept),
          borderColor: '#9b59b6',
          backgroundColor: 'rgba(155, 89, 182, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Sleep Score',
          data: sortedData.map(record => record.sleep_score / 10), // Scale down to match hours
          borderColor: '#f39c12',
          backgroundColor: 'rgba(243, 156, 18, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  };

  // Generate chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00f7ff',
        bodyColor: '#ffffff',
        borderColor: '#00f7ff',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              
              // Add units based on the dataset
              if (label.includes('Heart Rate')) {
                label += ' BPM';
              } else if (label.includes('Systolic') || label.includes('Diastolic')) {
                label += ' mmHg';
              } else if (label.includes('Oxygen')) {
                label += '%';
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [5, 5],
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          },
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Date',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {top: 10, bottom: 0}
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [5, 5],
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          },
          padding: 10
        },
        title: {
          display: true,
          text: 'Value',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {top: 0, bottom: 10}
        },
        beginAtZero: true
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
        hoverBorderWidth: 2
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 1000
    }
  };

  const sleepChartOptions = {
    ...lineChartOptions,
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        title: {
          display: true,
          text: 'Hours',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
      },
      y1: {
        position: 'right',
        title: {
          display: true,
          text: 'Score (scaled)',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [5, 5],
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          }
        },
        beginAtZero: true
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#ffffff',
          padding: 15,
          font: {
            size: 13,
            weight: 'bold'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00f7ff',
        bodyColor: '#ffffff',
        borderColor: '#00f7ff',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    },
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    }
  };

  // Export report as PDF with professional format
  const exportToPDF = async () => {
    try {
      // Create a temporary div for the professional report
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      
      // Render the professional report to the temporary div
      const root = ReactDOM.createRoot(tempDiv);
      root.render(
        <ProfessionalReport 
          user={user} 
          reportData={reportData} 
          timeRange={timeRange} 
        />
      );
      
      // Wait for the report to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate PDF from the professional report
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`health_report_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Clean up
      root.unmount();
      document.body.removeChild(tempDiv);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export PDF. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate health metrics summary
  const calculateHealthSummary = () => {
    if (!reportData) return null;
    
    const summary = {
      avgHeartRate: 0,
      avgSystolic: 0,
      avgDiastolic: 0,
      avgSpO2: 0,
      avgSleepHours: 0,
      avgMood: 0,
    };
    
    if (reportData.heartRate && reportData.heartRate.length > 0) {
      summary.avgHeartRate = Math.round(
        reportData.heartRate.reduce((sum, record) => sum + record.rate, 0) / reportData.heartRate.length
      );
    }
    
    if (reportData.bloodPressure && reportData.bloodPressure.length > 0) {
      summary.avgSystolic = Math.round(
        reportData.bloodPressure.reduce((sum, record) => sum + record.systolic, 0) / reportData.bloodPressure.length
      );
      summary.avgDiastolic = Math.round(
        reportData.bloodPressure.reduce((sum, record) => sum + record.diastolic, 0) / reportData.bloodPressure.length
      );
    }
    
    if (reportData.spo2 && reportData.spo2.length > 0) {
      summary.avgSpO2 = Math.round(
        reportData.spo2.reduce((sum, record) => sum + record.oxygen_level, 0) / reportData.spo2.length
      );
    }
    
    if (reportData.sleep && reportData.sleep.length > 0) {
      summary.avgSleepHours = (
        reportData.sleep.reduce((sum, record) => sum + record.hours_slept, 0) / reportData.sleep.length
      ).toFixed(1);
    }
    
    if (reportData.mood && reportData.mood.length > 0) {
      summary.avgMood = (
        reportData.mood.reduce((sum, record) => sum + record.mood, 0) / reportData.mood.length
      ).toFixed(1);
    }
    
    return summary;
  };

  const healthSummary = calculateHealthSummary();

  return (
    <div className="health-report-container">
      <div className="report-header">
        <h2>Health Activity Report</h2>
        <div className="report-controls">
          <div className="time-range-selector">
            <label htmlFor="timeRange">Time Range:</label>
            <select 
              id="timeRange" 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
          <button 
            className="export-button" 
            onClick={exportToPDF}
            disabled={isLoading || !reportData}
          >
            Export as PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading health data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : !reportData ? (
        <div className="no-data-message">
          <p>No health data available for the selected time period.</p>
        </div>
      ) : (
        <div className="report-content" ref={reportRef}>
          <div className="report-info">
            <p className="report-period">
              Report Period: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
            </p>
            <p className="user-info">
              User: {user.firstName} {user.lastName}
            </p>
          </div>

          {healthSummary && (
            <div className="health-summary">
              <h3>Health Summary</h3>
              <div className="summary-metrics">
                {healthSummary.avgHeartRate > 0 && (
                  <div className="metric-card">
                    <h4>Avg Heart Rate</h4>
                    <p>{healthSummary.avgHeartRate} <span>BPM</span></p>
                  </div>
                )}
                {healthSummary.avgSystolic > 0 && (
                  <div className="metric-card">
                    <h4>Avg Blood Pressure</h4>
                    <p>{healthSummary.avgSystolic}/{healthSummary.avgDiastolic} <span>mmHg</span></p>
                  </div>
                )}
                {healthSummary.avgSpO2 > 0 && (
                  <div className="metric-card">
                    <h4>Avg Oxygen Level</h4>
                    <p>{healthSummary.avgSpO2}<span>%</span></p>
                  </div>
                )}
                {healthSummary.avgSleepHours > 0 && (
                  <div className="metric-card">
                    <h4>Avg Sleep</h4>
                    <p>{healthSummary.avgSleepHours} <span>hours</span></p>
                  </div>
                )}
                {healthSummary.avgMood > 0 && (
                  <div className="metric-card">
                    <h4>Avg Mood</h4>
                    <p>{healthSummary.avgMood} <span>/5</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="charts-container">
            {/* Always display all available charts */}
            <div className="chart-card heart-rate-indicator">
              <div className="chart-title-container">
                <span className="chart-icon">❤️</span>
                <h3>Heart Rate Trends</h3>
              </div>
              <div className="chart-wrapper">
                {generateHeartRateChartData() ? (
                  <Line data={generateHeartRateChartData()} options={lineChartOptions} />
                ) : (
                  <p className="no-data">No heart rate data available for the selected time period.</p>
                )}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color heart-rate-color"></div>
                  <span className="legend-label">Heart Rate (BPM)</span>
                </div>
              </div>
            </div>

            <div className="chart-card blood-pressure-indicator">
              <div className="chart-title-container">
                <span className="chart-icon">🩸</span>
                <h3>Blood Pressure Trends</h3>
              </div>
              <div className="chart-wrapper">
                {generateBloodPressureChartData() ? (
                  <Line data={generateBloodPressureChartData()} options={lineChartOptions} />
                ) : (
                  <p className="no-data">No blood pressure data available for the selected time period.</p>
                )}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color systolic-color"></div>
                  <span className="legend-label">Systolic (mmHg)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color diastolic-color"></div>
                  <span className="legend-label">Diastolic (mmHg)</span>
                </div>
              </div>
            </div>

            <div className="chart-card oxygen-indicator">
              <div className="chart-title-container">
                <span className="chart-icon">💨</span>
                <h3>Oxygen Saturation Trends</h3>
              </div>
              <div className="chart-wrapper">
                {generateSpO2ChartData() ? (
                  <Line data={generateSpO2ChartData()} options={lineChartOptions} />
                ) : (
                  <p className="no-data">No SpO2 data available for the selected time period.</p>
                )}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color oxygen-color"></div>
                  <span className="legend-label">Oxygen Saturation (%)</span>
                </div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card half-width mood-indicator">
                <div className="chart-title-container">
                  <span className="chart-icon">😊</span>
                  <h3>Mood Distribution</h3>
                </div>
                <div className="chart-wrapper">
                  {generateMoodDistributionData() ? (
                    <Doughnut data={generateMoodDistributionData()} options={pieChartOptions} />
                  ) : (
                    <p className="no-data">No mood data available for the selected time period.</p>
                  )}
                </div>
              </div>

              <div className="chart-card half-width sleep-indicator">
                <div className="chart-title-container">
                  <span className="chart-icon">💤</span>
                  <h3>Sleep Quality</h3>
                </div>
                <div className="chart-wrapper">
                  {generateSleepQualityData() ? (
                    <Line data={generateSleepQualityData()} options={sleepChartOptions} />
                  ) : (
                    <p className="no-data">No sleep data available for the selected time period.</p>
                  )}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#9b59b6'}}></div>
                    <span className="legend-label">Hours Slept</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#f39c12'}}></div>
                    <span className="legend-label">Sleep Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="report-footer">
            <p>This report is generated based on your health data recorded in the Cyber Health platform.</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthReport;