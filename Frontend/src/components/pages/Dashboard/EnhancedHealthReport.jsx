import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { healthService } from '../../../services/healthService';
import { menstrualCycleService } from '../../../services/menstrualCycleService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale } from 'chart.js';
import { Line, Bar, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Dashboard.css';
import './HealthReport.css';

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
  Title,
  RadialLinearScale
);

const EnhancedHealthReport = () => {
  const { user } = useSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState('24hours');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [reportFormat, setReportFormat] = useState('detailed'); // 'summary', 'detailed'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'vitals', 'activity', 'menstrual', 'nutrition'
  const reportRef = useRef(null);

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
        const [
          heartRateData, 
          bloodPressureData, 
          spo2Data, 
          temperatureData, 
          weightData, 
          moodData, 
          sleepData,
          respiratoryRateData,
          glucoseData,
          cholesterolData,
          menstrualCycleData,
          menstrualSymptomsData,
          exerciseData,
          waterIntakeData,
          nutritionData
        ] = await Promise.all([
          healthService.getHeartRateHistory(user.id),
          healthService.getBloodPressureHistory(user.id),
          healthService.getSpO2History(user.id),
          healthService.getTemperatureHistory(user.id),
          healthService.getWeightHistory(user.id),
          healthService.getMoodHistory(user.id),
          healthService.getSleepHistory(user.id),
          healthService.getRespiratoryRateHistory(user.id),
          healthService.getGlucoseHistory(user.id).catch(() => ({ records: [] })),
          healthService.getCholesterolHistory(user.id).catch(() => ({ records: [] })),
          menstrualCycleService.getCycleHistory(user.id).catch(() => ({ records: [] })),
          menstrualCycleService.getSymptomsHistory(user.id).catch(() => ({ records: [] })),
          healthService.getExerciseHistory(user.id).catch(() => ({ records: [] })),
          healthService.getWaterIntakeHistory(user.id).catch(() => ({ records: [] })),
          healthService.getNutritionHistory(user.id).catch(() => ({ records: [] }))
        ]);
        
        // Filter data based on time range
        const filterByTimeRange = (data, dateField = 'recorded_at') => {
          if (!data || !data.records) return [];
          return data.records.filter(record => {
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
          respiratoryRate: filterByTimeRange(respiratoryRateData),
          glucose: filterByTimeRange(glucoseData),
          cholesterol: filterByTimeRange(cholesterolData),
          menstrualCycle: filterByTimeRange(menstrualCycleData),
          menstrualSymptoms: filterByTimeRange(menstrualSymptomsData),
          exercise: filterByTimeRange(exerciseData),
          waterIntake: filterByTimeRange(waterIntakeData),
          nutrition: filterByTimeRange(nutritionData),
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

  // Generate chart data for menstrual cycle
  const generateMenstrualCycleData = () => {
    if (!reportData || !reportData.menstrualCycle || reportData.menstrualCycle.length === 0) {
      return null;
    }
    
    const sortedData = [...reportData.menstrualCycle].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    // Create a dataset for cycle phases
    const cyclePhases = sortedData.map(record => ({
      date: new Date(record.recorded_at),
      phase: record.phase || 'unknown',
      flow: record.flow_intensity || 0
    }));
    
    // Group by phase for pie chart
    const phaseCount = {};
    cyclePhases.forEach(item => {
      phaseCount[item.phase] = (phaseCount[item.phase] || 0) + 1;
    });
    
    const phaseColors = {
      'menstrual': 'rgba(231, 76, 60, 0.7)',
      'follicular': 'rgba(230, 126, 34, 0.7)',
      'ovulation': 'rgba(241, 196, 15, 0.7)',
      'luteal': 'rgba(46, 204, 113, 0.7)',
      'unknown': 'rgba(189, 195, 199, 0.7)'
    };
    
    return {
      labels: Object.keys(phaseCount),
      datasets: [
        {
          data: Object.values(phaseCount),
          backgroundColor: Object.keys(phaseCount).map(phase => phaseColors[phase] || 'rgba(189, 195, 199, 0.7)'),
          borderColor: Object.keys(phaseCount).map(phase => phaseColors[phase]?.replace('0.7', '1') || 'rgba(189, 195, 199, 1)'),
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate chart data for menstrual symptoms
  const generateMenstrualSymptomsData = () => {
    if (!reportData || !reportData.menstrualSymptoms || reportData.menstrualSymptoms.length === 0) {
      return null;
    }
    
    // Count symptom occurrences
    const symptomCounts = {};
    
    reportData.menstrualSymptoms.forEach(record => {
      if (record.symptoms && Array.isArray(record.symptoms)) {
        record.symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      }
    });
    
    // Sort symptoms by frequency
    const sortedSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // Limit to top 8 symptoms
    
    return {
      labels: sortedSymptoms.map(([symptom]) => symptom),
      datasets: [
        {
          label: 'Symptom Frequency',
          data: sortedSymptoms.map(([_, count]) => count),
          backgroundColor: 'rgba(142, 68, 173, 0.7)',
          borderColor: 'rgba(142, 68, 173, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate chart data for exercise activity
  const generateExerciseData = () => {
    if (!reportData || !reportData.exercise || reportData.exercise.length === 0) {
      return null;
    }
    
    const sortedData = [...reportData.exercise].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    // Group exercises by type
    const exerciseTypes = {};
    sortedData.forEach(record => {
      const type = record.exercise_type || 'Other';
      if (!exerciseTypes[type]) {
        exerciseTypes[type] = [];
      }
      exerciseTypes[type].push(record);
    });
    
    // Create datasets for each exercise type
    const datasets = Object.entries(exerciseTypes).map(([type, records], index) => {
      const colors = [
        { border: '#3498db', bg: 'rgba(52, 152, 219, 0.2)' },
        { border: '#2ecc71', bg: 'rgba(46, 204, 113, 0.2)' },
        { border: '#e74c3c', bg: 'rgba(231, 76, 60, 0.2)' },
        { border: '#f39c12', bg: 'rgba(243, 156, 18, 0.2)' },
        { border: '#9b59b6', bg: 'rgba(155, 89, 182, 0.2)' },
      ];
      
      const colorIndex = index % colors.length;
      
      return {
        label: type,
        data: records.map(record => record.duration || 0),
        borderColor: colors[colorIndex].border,
        backgroundColor: colors[colorIndex].bg,
        borderWidth: 2,
      };
    });
    
    return {
      labels: sortedData.map(record => new Date(record.recorded_at).toLocaleDateString()),
      datasets,
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
          color: '#ffffff'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#00f7ff',
        bodyColor: '#ffffff',
        borderColor: '#00f7ff',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        },
      },
    },
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
        },
      },
      y1: {
        position: 'right',
        title: {
          display: true,
          text: 'Score (scaled)',
          color: '#ffffff',
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
        },
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
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#00f7ff',
        bodyColor: '#ffffff',
        borderColor: '#00f7ff',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  const barChartOptions = {
    ...lineChartOptions,
    indexAxis: 'y',
    plugins: {
      ...lineChartOptions.plugins,
      legend: {
        display: false,
      },
    },
  };

  // Export report as PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#121212'
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
      avgRespiratoryRate: 0,
      avgGlucose: 0,
      totalExerciseMinutes: 0,
      avgWaterIntake: 0,
      menstrualCycleLength: 0,
      menstrualPeriodLength: 0,
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
    
    if (reportData.respiratoryRate && reportData.respiratoryRate.length > 0) {
      summary.avgRespiratoryRate = Math.round(
        reportData.respiratoryRate.reduce((sum, record) => sum + record.rate, 0) / reportData.respiratoryRate.length
      );
    }
    
    if (reportData.glucose && reportData.glucose.length > 0) {
      summary.avgGlucose = Math.round(
        reportData.glucose.reduce((sum, record) => sum + record.level, 0) / reportData.glucose.length
      );
    }
    
    if (reportData.exercise && reportData.exercise.length > 0) {
      summary.totalExerciseMinutes = reportData.exercise.reduce((sum, record) => sum + (record.duration || 0), 0);
    }
    
    if (reportData.waterIntake && reportData.waterIntake.length > 0) {
      summary.avgWaterIntake = Math.round(
        reportData.waterIntake.reduce((sum, record) => sum + record.amount, 0) / reportData.waterIntake.length
      );
    }
    
    // Calculate menstrual cycle metrics if available
    if (reportData.menstrualCycle && reportData.menstrualCycle.length > 0) {
      // This is a simplified calculation - in a real app, you'd need more sophisticated logic
      const cycleData = reportData.menstrualCycle;
      if (cycleData.length >= 2) {
        // Sort by date
        const sortedCycles = [...cycleData].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
        
        // Calculate average cycle length
        let totalCycleLength = 0;
        let cycleCount = 0;
        
        for (let i = 1; i < sortedCycles.length; i++) {
          const currentDate = new Date(sortedCycles[i].recorded_at);
          const prevDate = new Date(sortedCycles[i-1].recorded_at);
          const daysDiff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0 && daysDiff < 45) { // Reasonable cycle length
            totalCycleLength += daysDiff;
            cycleCount++;
          }
        }
        
        if (cycleCount > 0) {
          summary.menstrualCycleLength = Math.round(totalCycleLength / cycleCount);
        }
        
        // Calculate average period length
        const periodDays = cycleData.filter(record => record.flow_intensity > 0).length;
        const uniquePeriods = new Set(cycleData
          .filter(record => record.flow_intensity > 0)
          .map(record => new Date(record.recorded_at).toISOString().split('T')[0].substring(0, 7)) // Group by month
        ).size;
        
        if (uniquePeriods > 0) {
          summary.menstrualPeriodLength = Math.round(periodDays / uniquePeriods);
        }
      }
    }
    
    return summary;
  };

  const healthSummary = calculateHealthSummary();

  // Generate health insights based on the data
  const analyzeHealthData = (healthSummary) => {
    if (!healthSummary) return [];
    
    const insights = [];
    
    // Heart rate insights
    if (healthSummary.avgHeartRate > 0) {
      if (healthSummary.avgHeartRate > 100) {
        insights.push({
          type: 'warning',
          metric: 'Heart Rate',
          message: 'Your average heart rate is elevated. Consider consulting with a healthcare provider.'
        });
      } else if (healthSummary.avgHeartRate < 60) {
        insights.push({
          type: 'info',
          metric: 'Heart Rate',
          message: 'Your average heart rate is lower than normal. This could be due to good fitness or medication.'
        });
      } else {
        insights.push({
          type: 'positive',
          metric: 'Heart Rate',
          message: 'Your average heart rate is within the normal range.'
        });
      }
    }
    
    // Blood pressure insights
    if (healthSummary.avgSystolic > 0 && healthSummary.avgDiastolic > 0) {
      if (healthSummary.avgSystolic >= 140 || healthSummary.avgDiastolic >= 90) {
        insights.push({
          type: 'warning',
          metric: 'Blood Pressure',
          message: 'Your average blood pressure is elevated. Consider lifestyle changes and consult a healthcare provider.'
        });
      } else if (healthSummary.avgSystolic < 90 || healthSummary.avgDiastolic < 60) {
        insights.push({
          type: 'warning',
          metric: 'Blood Pressure',
          message: 'Your average blood pressure is lower than normal. Monitor for symptoms like dizziness.'
        });
      } else {
        insights.push({
          type: 'positive',
          metric: 'Blood Pressure',
          message: 'Your average blood pressure is within the normal range.'
        });
      }
    }
    
    // SpO2 insights
    if (healthSummary.avgSpO2 > 0) {
      if (healthSummary.avgSpO2 < 95) {
        insights.push({
          type: 'warning',
          metric: 'Oxygen Saturation',
          message: 'Your average oxygen saturation is below optimal levels. Consider consulting a healthcare provider.'
        });
      } else {
        insights.push({
          type: 'positive',
          metric: 'Oxygen Saturation',
          message: 'Your average oxygen saturation is within the healthy range.'
        });
      }
    }
    
    // Sleep insights
    if (healthSummary.avgSleepHours > 0) {
      if (healthSummary.avgSleepHours < 7) {
        insights.push({
          type: 'warning',
          metric: 'Sleep',
          message: 'You are averaging less than 7 hours of sleep. Try to improve your sleep habits.'
        });
      } else if (healthSummary.avgSleepHours > 9) {
        insights.push({
          type: 'info',
          metric: 'Sleep',
          message: 'You are sleeping more than 9 hours on average. While rest is important, excessive sleep may indicate other issues.'
        });
      } else {
        insights.push({
          type: 'positive',
          metric: 'Sleep',
          message: 'Your sleep duration is within the recommended range of 7-9 hours.'
        });
      }
    }
    
    // Exercise insights
    if (healthSummary.totalExerciseMinutes > 0) {
      const weeklyExerciseMinutes = (healthSummary.totalExerciseMinutes / (timeRanges[timeRange] / (7 * 24 * 60 * 60 * 1000)));
      if (weeklyExerciseMinutes < 150) {
        insights.push({
          type: 'info',
          metric: 'Exercise',
          message: 'You are getting less than the recommended 150 minutes of exercise per week.'
        });
      } else {
        insights.push({
          type: 'positive',
          metric: 'Exercise',
          message: 'You are meeting or exceeding the recommended exercise guidelines.'
        });
      }
    }
    
    return insights;
  };

  // Generate health insights based on data
  const generateHealthInsights = () => {
    if (!reportData) return [];
    
    const healthSummary = calculateHealthSummary();
    return analyzeHealthData(healthSummary);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="enhanced-health-report loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your health report...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="enhanced-health-report error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // Render the health report
  return (
    <div className="enhanced-health-report" ref={reportRef}>
      <div className="report-header">
        <h1>Enhanced Health Report</h1>
        <div className="report-controls">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-dropdown"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="weekly">Last Week</option>
              <option value="monthly">Last Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
          
          <div className="format-selector">
            <label>Format:</label>
            <div className="format-options">
              <button 
                className={reportFormat === 'summary' ? 'active' : ''}
                onClick={() => setReportFormat('summary')}
              >
                Summary
              </button>
              <button 
                className={reportFormat === 'detailed' ? 'active' : ''}
                onClick={() => setReportFormat('detailed')}
              >
                Detailed
              </button>
            </div>
          </div>
          
          <button onClick={exportToPDF} className="export-button">
            Export PDF
          </button>
        </div>
      </div>
      
      {reportData && (
        <div className="report-date-range">
          <p>Report Period: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
        </div>
      )}
      
      <div className="report-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'vitals' ? 'active' : ''}
          onClick={() => setActiveTab('vitals')}
        >
          Vital Signs
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => setActiveTab('activity')}
        >
          Activity & Sleep
        </button>
        <button 
          className={activeTab === 'menstrual' ? 'active' : ''}
          onClick={() => setActiveTab('menstrual')}
        >
          Menstrual Health
        </button>
        <button 
          className={activeTab === 'nutrition' ? 'active' : ''}
          onClick={() => setActiveTab('nutrition')}
        >
          Nutrition
        </button>
      </div>
      
      <div className="report-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="health-summary-card">
              <h2>Health Summary</h2>
              {reportData && calculateHealthSummary() && (
                <div className="summary-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Avg Heart Rate</span>
                    <span className="metric-value">{calculateHealthSummary().avgHeartRate || 'N/A'} BPM</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Avg Blood Pressure</span>
                    <span className="metric-value">
                      {calculateHealthSummary().avgSystolic || 'N/A'}/{calculateHealthSummary().avgDiastolic || 'N/A'} mmHg
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Avg SpO2</span>
                    <span className="metric-value">{calculateHealthSummary().avgSpO2 || 'N/A'}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Avg Sleep</span>
                    <span className="metric-value">{calculateHealthSummary().avgSleepHours || 'N/A'} hours</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Exercise</span>
                    <span className="metric-value">{calculateHealthSummary().totalExerciseMinutes || 'N/A'} minutes</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="health-insights-card">
              <h2>Health Insights</h2>
              <div className="insights-list">
                {generateHealthInsights().map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.type}`}>
                    <div className="insight-icon">
                      {insight.type === 'positive' && '✓'}
                      {insight.type === 'warning' && '⚠️'}
                      {insight.type === 'info' && 'ℹ️'}
                    </div>
                    <div className="insight-content">
                      <h3>{insight.metric}</h3>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
                {generateHealthInsights().length === 0 && (
                  <p className="no-insights">Not enough data to generate insights.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'vitals' && (
          <div className="vitals-section">
            <div className="chart-container">
              <h2>Heart Rate</h2>
              {generateHeartRateChartData() ? (
                <Line data={generateHeartRateChartData()} options={lineChartOptions} />
              ) : (
                <p className="no-data">No heart rate data available for the selected time period.</p>
              )}
            </div>
            
            <div className="chart-container">
              <h2>Blood Pressure</h2>
              {generateBloodPressureChartData() ? (
                <Line data={generateBloodPressureChartData()} options={lineChartOptions} />
              ) : (
                <p className="no-data">No blood pressure data available for the selected time period.</p>
              )}
            </div>
            
            <div className="chart-container">
              <h2>Oxygen Saturation (SpO2)</h2>
              {generateSpO2ChartData() ? (
                <Line data={generateSpO2ChartData()} options={lineChartOptions} />
              ) : (
                <p className="no-data">No SpO2 data available for the selected time period.</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="activity-section">
            <div className="chart-container">
              <h2>Sleep Quality</h2>
              {generateSleepQualityData() ? (
                <Line data={generateSleepQualityData()} options={sleepChartOptions} />
              ) : (
                <p className="no-data">No sleep data available for the selected time period.</p>
              )}
            </div>
            
            <div className="chart-container">
              <h2>Exercise Activity</h2>
              {generateExerciseData() ? (
                <Bar data={generateExerciseData()} options={lineChartOptions} />
              ) : (
                <p className="no-data">No exercise data available for the selected time period.</p>
              )}
            </div>
            
            <div className="chart-container">
              <h2>Mood Distribution</h2>
              {generateMoodDistributionData() ? (
                <Doughnut data={generateMoodDistributionData()} options={pieChartOptions} />
              ) : (
                <p className="no-data">No mood data available for the selected time period.</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'menstrual' && (
          <div className="menstrual-section">
            <div className="chart-container">
              <h2>Menstrual Cycle Phases</h2>
              {generateMenstrualCycleData() ? (
                <Pie data={generateMenstrualCycleData()} options={pieChartOptions} />
              ) : (
                <p className="no-data">No menstrual cycle data available for the selected time period.</p>
              )}
            </div>
            
            <div className="chart-container">
              <h2>Common Symptoms</h2>
              {generateMenstrualSymptomsData() ? (
                <Bar data={generateMenstrualSymptomsData()} options={barChartOptions} />
              ) : (
                <p className="no-data">No symptom data available for the selected time period.</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'nutrition' && (
          <div className="nutrition-section">
            <p className="coming-soon">Detailed nutrition analytics coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHealthReport;
    