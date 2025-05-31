/**
 * Report Service
 * Handles fetching and processing health data for generating comprehensive health reports
 */

import { healthService } from './healthService';

const reportService = {
  /**
   * Fetch comprehensive health data for a user within a specified time range
   * @param {string} userId - The user ID
   * @param {string} timeRange - Time range (24hours, weekly, monthly, 3months)
   * @returns {Promise<Object>} - Processed health data for reporting
   */
  async fetchHealthReportData(userId, timeRange) {
    // Define time ranges in milliseconds
    const timeRanges = {
      '24hours': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000,
      'monthly': 30 * 24 * 60 * 60 * 1000,
      '3months': 90 * 24 * 60 * 60 * 1000
    };
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeRanges[timeRange]);
    
    try {
      // Fetch data from different health services in parallel
      const [
        heartRateData,
        bloodPressureData,
        spo2Data,
        temperatureData,
        weightData,
        moodData,
        sleepData,
        mentalFatigueData,
        anxietyData,
        depressionData
      ] = await Promise.all([
        healthService.getHeartRateHistory(userId),
        healthService.getBloodPressureHistory(userId),
        healthService.getSpO2History(userId),
        healthService.getTemperatureHistory(userId),
        healthService.getWeightHistory(userId),
        healthService.getMoodHistory(userId),
        healthService.getSleepHistory(userId),
        healthService.getMentalFatigueHistory(userId),
        healthService.getAnxietyHistory(userId),
        healthService.getDepressionHistory(userId)
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
      return {
        heartRate: filterByTimeRange(heartRateData),
        bloodPressure: filterByTimeRange(bloodPressureData),
        spo2: filterByTimeRange(spo2Data),
        temperature: filterByTimeRange(temperatureData),
        weight: filterByTimeRange(weightData),
        mood: filterByTimeRange(moodData),
        sleep: filterByTimeRange(sleepData),
        mentalFatigue: filterByTimeRange(mentalFatigueData),
        anxiety: filterByTimeRange(anxietyData),
        depression: filterByTimeRange(depressionData),
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error fetching health report data:', error);
      throw new Error('Failed to fetch health data for report generation');
    }
  },
  
  /**
   * Calculate health metrics summary from report data
   * @param {Object} reportData - The health report data
   * @returns {Object} - Summary metrics
   */
  calculateHealthSummary(reportData) {
    if (!reportData) return null;
    
    const summary = {
      avgHeartRate: 0,
      avgSystolic: 0,
      avgDiastolic: 0,
      avgSpO2: 0,
      avgSleepHours: 0,
      avgMood: 0,
      avgWeight: 0,
      avgTemperature: 0,
      recordCounts: {}
    };
    
    // Count records for each category
    Object.keys(reportData).forEach(key => {
      if (Array.isArray(reportData[key])) {
        summary.recordCounts[key] = reportData[key].length;
      }
    });
    
    // Calculate averages
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
      summary.avgSleepHours = parseFloat(
        (reportData.sleep.reduce((sum, record) => sum + record.hours_slept, 0) / reportData.sleep.length).toFixed(1)
      );
    }
    
    if (reportData.mood && reportData.mood.length > 0) {
      summary.avgMood = parseFloat(
        (reportData.mood.reduce((sum, record) => sum + record.mood, 0) / reportData.mood.length).toFixed(1)
      );
    }
    
    if (reportData.weight && reportData.weight.length > 0) {
      summary.avgWeight = parseFloat(
        (reportData.weight.reduce((sum, record) => sum + record.weight, 0) / reportData.weight.length).toFixed(1)
      );
    }
    
    if (reportData.temperature && reportData.temperature.length > 0) {
      summary.avgTemperature = parseFloat(
        (reportData.temperature.reduce((sum, record) => sum + record.temperature, 0) / reportData.temperature.length).toFixed(1)
      );
    }
    
    return summary;
  },
  
  /**
   * Generate health insights based on the report data
   * @param {Object} reportData - The health report data
   * @param {Object} summary - The calculated summary metrics
   * @returns {Array} - Array of insight objects with message and type
   */
  generateHealthInsights(reportData, summary) {
    if (!reportData || !summary) return [];
    
    const insights = [];
    
    // Heart rate insights
    if (summary.avgHeartRate > 0) {
      if (summary.avgHeartRate > 100) {
        insights.push({
          type: 'warning',
          message: 'Your average heart rate is elevated. Consider consulting with a healthcare professional.'
        });
      } else if (summary.avgHeartRate < 60) {
        insights.push({
          type: 'info',
          message: 'Your average heart rate is on the lower side. This can be normal for physically active individuals.'
        });
      } else {
        insights.push({
          type: 'success',
          message: 'Your average heart rate is within the normal range.'
        });
      }
    }
    
    // Blood pressure insights
    if (summary.avgSystolic > 0 && summary.avgDiastolic > 0) {
      if (summary.avgSystolic >= 140 || summary.avgDiastolic >= 90) {
        insights.push({
          type: 'warning',
          message: 'Your average blood pressure readings indicate hypertension. Please consult with a healthcare provider.'
        });
      } else if (summary.avgSystolic >= 120 || summary.avgDiastolic >= 80) {
        insights.push({
          type: 'info',
          message: 'Your average blood pressure readings indicate pre-hypertension. Consider lifestyle modifications.'
        });
      } else {
        insights.push({
          type: 'success',
          message: 'Your average blood pressure is within the normal range.'
        });
      }
    }
    
    // SpO2 insights
    if (summary.avgSpO2 > 0) {
      if (summary.avgSpO2 < 95) {
        insights.push({
          type: 'warning',
          message: 'Your average oxygen saturation is below the normal range. Consider consulting with a healthcare professional.'
        });
      } else {
        insights.push({
          type: 'success',
          message: 'Your average oxygen saturation is within the normal range.'
        });
      }
    }
    
    // Sleep insights
    if (summary.avgSleepHours > 0) {
      if (summary.avgSleepHours < 7) {
        insights.push({
          type: 'warning',
          message: 'You are averaging less than 7 hours of sleep. Most adults need 7-9 hours for optimal health.'
        });
      } else if (summary.avgSleepHours > 9) {
        insights.push({
          type: 'info',
          message: 'You are averaging more than 9 hours of sleep. While this may be normal for some, excessive sleep can sometimes indicate health issues.'
        });
      } else {
        insights.push({
          type: 'success',
          message: 'Your average sleep duration is within the recommended range of 7-9 hours.'
        });
      }
    }
    
    // Mood insights
    if (summary.avgMood > 0) {
      if (summary.avgMood < 3) {
        insights.push({
          type: 'warning',
          message: 'Your average mood score is on the lower side. Consider activities that boost your mental wellbeing.'
        });
      } else if (summary.avgMood >= 4) {
        insights.push({
          type: 'success',
          message: 'Your average mood score is positive. Keep up the good work!'
        });
      } else {
        insights.push({
          type: 'info',
          message: 'Your average mood score is neutral. Consider incorporating more activities you enjoy.'
        });
      }
    }
    
    return insights;
  }
};

export default reportService;