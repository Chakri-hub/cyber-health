import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { healthService } from '../../../../../services/healthService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './WeightLogger.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Utility function for safe date formatting
const safeFormatDate = (date, formatString) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

const WeightLogger = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;

  const [activeTab, setActiveTab] = useState('logger');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [bmiHistory, setBmiHistory] = useState([]);

  // Fetch weight history on component mount
  useEffect(() => {
    if (user) {
      fetchWeightHistory();
    }
  }, [user]);

  // Fetch weight history from API
  const fetchWeightHistory = async () => {
    try {
      setLoading(true);
      const history = await healthService.getWeightHistory(user.id);
      if (history && history.length > 0) {
        // Filter out entries with invalid dates
        const validHistory = history.filter(entry => {
          const date = new Date(entry.date);
          return !isNaN(date.getTime());
        });
        
        if (validHistory.length < history.length) {
          console.warn(`Filtered out ${history.length - validHistory.length} entries with invalid dates`);
        }
        
        setWeightHistory(validHistory);
        
        // Calculate BMI history
        const bmiData = validHistory.map(entry => {
          const calculatedBmi = calculateBMI(entry.weight, entry.height, entry.unit, entry.heightUnit);
          return {
            ...entry,
            bmi: calculatedBmi,
            category: getBmiCategory(calculatedBmi)
          };
        });
        setBmiHistory(bmiData);
      }
    } catch (err) {
      console.error('Error fetching weight history:', err);
      setError('Failed to fetch history: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Input validation for weight
  const handleWeightChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setWeight(value);
  };

  // Input validation for height
  const handleHeightChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setHeight(value);
  };

  // Handle notes input - removing validation to allow special characters
  const handleNotesChange = (e) => {
    // Removed validation to allow all characters including special characters and numbers
    setNotes(e.target.value);
  };

  // Calculate BMI
  const calculateBMI = (weight, height, weightUnit, heightUnit) => {
    if (!weight || !height) return null;

    let weightInKg = parseFloat(weight);
    let heightInMeters = parseFloat(height);

    // Convert to metric if needed
    if (weightUnit === 'lb') {
      weightInKg = weightInKg * 0.453592; // lb to kg
    }

    if (heightUnit === 'cm') {
      heightInMeters = heightInMeters / 100; // cm to meters
    } else if (heightUnit === 'ft') {
      heightInMeters = heightInMeters * 0.3048; // ft to meters
    }

    // BMI formula: weight(kg) / height(m)²
    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    return bmiValue.toFixed(1);
  };

  // Get BMI category
  const getBmiCategory = (bmi) => {
    if (!bmi) return '';
    
    const bmiValue = parseFloat(bmi);
    
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal weight';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  // Toggle between kg and lb
  const toggleWeightUnit = () => {
    const newUnit = unit === 'kg' ? 'lb' : 'kg';
    let convertedWeight = '';
    
    if (weight) {
      const weightValue = parseFloat(weight);
      if (newUnit === 'lb') {
        convertedWeight = (weightValue * 2.20462).toFixed(1); // kg to lb
      } else {
        convertedWeight = (weightValue * 0.453592).toFixed(1); // lb to kg
      }
    }
    
    setUnit(newUnit);
    setWeight(convertedWeight);
  };

  // Toggle between cm and ft
  const toggleHeightUnit = () => {
    const newUnit = heightUnit === 'cm' ? 'ft' : 'cm';
    let convertedHeight = '';
    
    if (height) {
      const heightValue = parseFloat(height);
      if (newUnit === 'ft') {
        convertedHeight = (heightValue * 0.0328084).toFixed(1); // cm to ft
      } else {
        convertedHeight = (heightValue * 30.48).toFixed(1); // ft to cm
      }
    }
    
    setHeightUnit(newUnit);
    setHeight(convertedHeight);
  };

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (weight && height) {
      const calculatedBmi = calculateBMI(weight, height, unit, heightUnit);
      setBmi(calculatedBmi);
      setBmiCategory(getBmiCategory(calculatedBmi));
    } else {
      setBmi(null);
      setBmiCategory('');
    }
  }, [weight, height, unit, heightUnit]);

  // Set the current date for the date input and get max date value to prevent future dates
  const getCurrentDate = () => {
    return safeFormatDate(new Date(), 'yyyy-MM-dd');
  };

  useEffect(() => {
    // Set the initial date when component mounts to current date
    setDate(getCurrentDate());
  }, []);

  // Prevent date changes - force current date only
  const handleDateChange = (e) => {
    // Ignore user date changes and keep current date
    setDate(getCurrentDate());
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!weight || !height) {
      setError('Please enter both weight and height.');
      return;
    }
    
    // Validate date
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      setError('Please select a valid date.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the data object to send to the API
      const weightData = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        unit,
        heightUnit,
        bmi: parseFloat(bmi),
        bmiCategory,
        date,
        notes
      };
      
      console.log('Saving weight data:', weightData);
      
      // Call the API to save weight data
      const result = await healthService.saveWeight(user.id, weightData);
      
      setSuccess('Weight and BMI recorded successfully!');
      
      // Refresh history after saving
      fetchWeightHistory();
      
      // Reset form
      setWeight('');
      setHeight('');
      setDate(getCurrentDate());
      setNotes('');
      
    } catch (err) {
      console.error('Error saving weight:', err);
      setError('Failed to save data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: weightHistory.map(entry => safeFormatDate(entry.date, 'MMM d')),
    datasets: [
      {
        label: 'Weight',
        data: weightHistory.map(entry => entry.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'BMI',
        data: bmiHistory.map(entry => entry.bmi),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="weight-logger">
      <div className="weight-header">
        <h1>Weight Logger with BMI Calculator</h1>
        <p>Track your weight and calculate your Body Mass Index (BMI)</p>
        {!user && (
          <div className="warning-message">
            You are not logged in. You can use the calculator, but cannot save readings.
          </div>
        )}
      </div>
      
      <div className="tabs">
        <button 
          className={activeTab === 'logger' ? 'active' : ''} 
          onClick={() => setActiveTab('logger')}
        >
          Log Weight
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
          disabled={!user}
        >
          View History
        </button>
        <button 
          className={activeTab === 'information' ? 'active' : ''} 
          onClick={() => setActiveTab('information')}
        >
          BMI Information
        </button>
      </div>
      
      {activeTab === 'logger' && (
        <div className="logger-section">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">Weight</label>
                <div className="input-with-toggle">
                  <input 
                    type="text" 
                    id="weight" 
                    value={weight} 
                    onChange={handleWeightChange} 
                    placeholder={`Enter weight in ${unit}`}
                  />
                  <button 
                    type="button" 
                    onClick={toggleWeightUnit} 
                    className="unit-toggle"
                  >
                    {unit.toUpperCase()}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height</label>
                <div className="input-with-toggle">
                  <input 
                    type="text" 
                    id="height" 
                    value={height} 
                    onChange={handleHeightChange} 
                    placeholder={`Enter height in ${heightUnit}`}
                  />
                  <button 
                    type="button" 
                    onClick={toggleHeightUnit} 
                    className="unit-toggle"
                  >
                    {heightUnit.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  value={date}
                  onChange={handleDateChange}
                  max={getCurrentDate()}
                  min={getCurrentDate()}
                  readOnly
                />
                <small className="date-hint">Only current date allowed</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <input 
                  type="text" 
                  id="notes" 
                  value={notes} 
                  onChange={handleNotesChange} 
                  placeholder="Any additional notes" 
                />
              </div>
            </div>
            
            {bmi && (
              <div className="bmi-result">
                <h3>Your BMI</h3>
                <div className={`bmi-value ${bmiCategory.toLowerCase().replace(' ', '-')}`}>
                  {bmi}
                </div>
                <div className="bmi-category">{bmiCategory}</div>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading || !user}
            >
              {loading ? 'Saving...' : 'Save Weight & BMI'}
            </button>
          </form>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="history-section">
          <h2>Weight & BMI History</h2>
          
          {weightHistory.length === 0 ? (
            <p className="empty-state">No weight entries yet. Log your weight to see history.</p>
          ) : (
            <>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>
              
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight</th>
                      <th>Height</th>
                      <th>BMI</th>
                      <th>Category</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bmiHistory.map((entry, index) => (
                      <tr key={index}>
                        <td>{safeFormatDate(entry.date, 'MMM d, yyyy')}</td>
                        <td>{entry.weight} {entry.unit}</td>
                        <td>{entry.height} {entry.heightUnit}</td>
                        <td>{entry.bmi}</td>
                        <td className={entry.category.toLowerCase().replace(' ', '-')}>
                          {entry.category}
                        </td>
                        <td>{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
      
      {activeTab === 'information' && (
        <div className="information-section">
          <h2>Understanding BMI</h2>
          
          <div className="info-card">
            <h3>What is BMI?</h3>
            <p>Body Mass Index (BMI) is a numerical value of your weight in relation to your height. It is a common tool used to categorize a person as underweight, normal weight, overweight, or obese.</p>
          </div>
          
          <div className="info-card">
            <h3>BMI Categories</h3>
            <div className="bmi-categories">
              <div className="bmi-category-card underweight">
                <h4>Underweight</h4>
                <p>BMI less than 18.5</p>
                <p>May indicate malnutrition or other health problems</p>
              </div>
              
              <div className="bmi-category-card normal-weight">
                <h4>Normal Weight</h4>
                <p>BMI between 18.5 and 24.9</p>
                <p>Generally associated with good health</p>
              </div>
              
              <div className="bmi-category-card overweight">
                <h4>Overweight</h4>
                <p>BMI between 25 and 29.9</p>
                <p>May increase risk of health problems</p>
              </div>
              
              <div className="bmi-category-card obese">
                <h4>Obese</h4>
                <p>BMI of 30 or higher</p>
                <p>Increases risk of many health issues</p>
              </div>
            </div>
          </div>
          
          <div className="info-card">
            <h3>BMI Limitations</h3>
            <p>BMI does not distinguish between weight from muscle and weight from fat. It may overestimate body fat in athletes or people with muscular builds, and underestimate it in older persons or those who have lost muscle mass.</p>
            <p>BMI is just one tool for assessing health and should be used alongside other measurements and considerations.</p>
          </div>
          
          <div className="info-card">
            <h3>Tips for Healthy Weight Management</h3>
            <ul className="tips-list">
              <li>Focus on balanced nutrition with plenty of fruits, vegetables, lean proteins, and whole grains</li>
              <li>Stay physically active with at least 150 minutes of moderate exercise per week</li>
              <li>Stay hydrated by drinking plenty of water throughout the day</li>
              <li>Get adequate sleep, as poor sleep is linked to weight gain</li>
              <li>Manage stress through relaxation techniques, as stress can affect weight</li>
              <li>Consult healthcare professionals before starting any weight management program</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightLogger; 