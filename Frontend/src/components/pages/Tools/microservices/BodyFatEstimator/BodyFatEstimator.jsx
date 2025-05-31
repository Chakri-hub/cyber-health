import React, { useState, useEffect } from 'react';
import './BodyFatEstimator.css';

const BodyFatEstimator = () => {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [neck, setNeck] = useState('');
  const [bodyFat, setBodyFat] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [estimationMethod, setEstimationMethod] = useState('navy'); // 'navy' or 'visual'
  const [sliderValue, setSliderValue] = useState(15);
  const [validWaist, setValidWaist] = useState(true);
  const [validNeck, setValidNeck] = useState(true);
  const [validHip, setValidHip] = useState(true);
  
  // Reference body fat percentage ranges by gender and age
  const bodyFatRanges = {
    male: {
      essential: 2,
      athlete: { min: 3, max: 5 },
      fitness: { min: 6, max: 13 },
      average: { min: 14, max: 24 },
      obese: 25
    },
    female: {
      essential: 10,
      athlete: { min: 11, max: 14 },
      fitness: { min: 15, max: 20 },
      average: { min: 21, max: 31 },
      obese: 32
    }
  };

  // Track input validation states
  const [validAge, setValidAge] = useState(false);
  const [validWeight, setValidWeight] = useState(false);
  const [validHeight, setValidHeight] = useState(false);

  // Input validation is now handled via CSS classes
  
  // Validate inputs whenever they change
  useEffect(() => {
    // Age validation (must not be empty)
    setValidAge(age !== '');
    
    // Weight validation (must not be empty)
    setValidWeight(weight !== '');
    
    // Height validation (must not be empty)
    setValidHeight(heightCm !== '');
    
    // Neck validation (must not be empty and must be a valid number)
    setValidNeck(neck !== '' && !isNaN(neck) && parseFloat(neck) > 0);
    
    // Waist validation (must not be empty and must be a valid number)
    setValidWaist(waist !== '' && !isNaN(waist) && parseFloat(waist) > 0);
    
    // Hip validation (only required for females)
    setValidHip(gender !== 'female' || (hip !== '' && !isNaN(hip) && parseFloat(hip) > 0));
    
  }, [age, weight, heightCm, neck, waist, hip, gender]);

  // Input sanitization handlers
  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAge(value);
    
    if (value && !isNaN(value) && parseInt(value) > 0) {
      // Auto-calculate if all required fields are filled
      if (validNeck && validWaist && (gender === 'male' || (gender === 'female' && validHip))) {
        calculateBodyFat();
      }
    }
  };

  const handleWeightChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setWeight(value);
    
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      // Auto-calculate if all required fields are filled
      if (validNeck && validWaist && (gender === 'male' || (gender === 'female' && validHip))) {
        calculateBodyFat();
      }
    }
  };

  const handleHeightChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setHeightCm(value);
    
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      // Auto-calculate if all required fields are filled
      if (validNeck && validWaist && (gender === 'male' || (gender === 'female' && validHip))) {
        calculateBodyFat();
      }
    }
  };

  const handleNeckChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    const value = parseFloat(sanitizedValue);
    setNeck(sanitizedValue);
    
    if (sanitizedValue === '' || isNaN(value) || value <= 0) {
      setValidNeck(false);
    } else {
      setValidNeck(true);
      if (validWaist && (gender === 'male' || (gender === 'female' && validHip))) {
        calculateBodyFat();
      }
    }
  };

  const handleWaistChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    const value = parseFloat(sanitizedValue);
    setWaist(sanitizedValue);
    
    if (sanitizedValue === '' || isNaN(value) || value <= 0) {
      setValidWaist(false);
    } else {
      setValidWaist(true);
      if (validNeck && (gender === 'male' || (gender === 'female' && validHip))) {
        calculateBodyFat();
      }
    }
  };

  const handleHipChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    const value = parseFloat(sanitizedValue);
    setHip(sanitizedValue);
    
    if (sanitizedValue === '' || isNaN(value) || value <= 0) {
      setValidHip(false);
    } else {
      setValidHip(true);
      if (validNeck && validWaist && gender === 'female') {
        calculateBodyFat();
      }
    }
  };

  const calculateBodyFat = () => {
    if (estimationMethod === 'navy') {
      // Check if all required inputs are valid
      if (!validAge || !validWeight || !validHeight || !validNeck || !validWaist || (gender === 'female' && !validHip)) {
        setBodyFat(null);
        setFitnessLevel('');
        return;
      }

      // Convert string inputs to numbers
      const neckValue = parseFloat(neck);
      const waistValue = parseFloat(waist);
      const hipValue = gender === 'female' ? parseFloat(hip) : 0;
      
      if (isNaN(neckValue) || isNaN(waistValue) || (gender === 'female' && isNaN(hipValue))) {
        setBodyFat(null);
        setFitnessLevel('');
        return;
      }

      let bodyFat;
      if (gender === 'male') {
        // Male Navy method formula
        bodyFat = 86.010 * Math.log10(waistValue - neckValue) - 70.041 * Math.log10(heightCm) + 36.76;
      } else {
        // Female Navy method formula
        bodyFat = 163.205 * Math.log10(waistValue + hipValue - neckValue) - 97.684 * Math.log10(heightCm) - 104.912;
      }

      // Round to one decimal place and ensure it's not negative
      bodyFat = Math.max(0, Math.round(bodyFat * 10) / 10);
      
      setBodyFat(bodyFat.toFixed(1));
      
      // Use the fitness categories directly without age grouping
      const fitnessCategories = bodyFatRanges[gender];
      
      let level = '';
      if (bodyFat <= fitnessCategories.essential) {
        level = 'Essential Fat';
      } else if (bodyFat <= fitnessCategories.athlete) {
        level = 'Athletic';
      } else if (bodyFat <= fitnessCategories.fitness) {
        level = 'Fitness';
      } else if (bodyFat <= fitnessCategories.average) {
        level = 'Average';
      } else {
        level = 'Obese';
      }
      
      setFitnessLevel(level);
    } else {
      // Visual slider method
      setBodyFat(sliderValue);
      determineFitnessLevel(sliderValue);
    }
  };

  const determineFitnessLevel = (bf) => {
    const ranges = bodyFatRanges[gender];
    
    if (bf <= ranges.essential) {
      setFitnessLevel('Essential Fat (Warning: Too Low)');
    } else if (bf <= ranges.athlete.max) {
      setFitnessLevel('Athlete');
    } else if (bf <= ranges.fitness.max) {
      setFitnessLevel('Fitness');
    } else if (bf <= ranges.average.max) {
      setFitnessLevel('Average');
    } else {
      setFitnessLevel('Obese');
    }
  };

  // Handle slider change for visual method
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setSliderValue(value);
      // Calculate the fitness level based on the slider value
      let level = '';
      const val = parseInt(value);
      if (gender === 'male') {
        if (val < 10) level = 'Essential Fat';
        else if (val < 14) level = 'Athletes';
        else if (val < 21) level = 'Fitness';
        else if (val < 25) level = 'Average';
        else level = 'Obese';
      } else {
        if (val < 14) level = 'Essential Fat';
        else if (val < 21) level = 'Athletes';
        else if (val < 25) level = 'Fitness';
        else if (val < 32) level = 'Average';
        else level = 'Obese';
      }
      setFitnessLevel(level);
    }
  };

  const resetForm = () => {
    setWeight('');
    setHeightCm('');
    setWaist('');
    setHip('');
    setNeck('');
    setBodyFat(null);
    setFitnessLevel('');
    setSliderValue(15);
    setValidAge(true);
    setValidWeight(true);
    setValidHeight(true);
    setValidWaist(true);
    setValidNeck(true);
    setValidHip(true);
  };
  
  const switchUnit = () => {
    resetForm();
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const unitLabels = {
    weight: unit === 'metric' ? 'kg' : 'lbs',
    height: unit === 'metric' ? 'cm' : 'inches',
    circumference: unit === 'metric' ? 'cm' : 'inches',
  };

  return (
    <div className="body-fat-estimator">
      <h2>Body Fat Percentage Estimator</h2>
      <p className="tool-description">
        Estimate your body fat percentage using either the Navy formula (more accurate) 
        or a visual estimation method. The Navy formula requires precise measurements.
      </p>

      <div className="method-selector">
        <button 
          className={`method-button ${estimationMethod === 'navy' ? 'active' : ''}`}
          onClick={() => setEstimationMethod('navy')}
        >
          Navy Formula
        </button>
        <button 
          className={`method-button ${estimationMethod === 'visual' ? 'active' : ''}`}
          onClick={() => setEstimationMethod('visual')}
        >
          Visual Slider
        </button>
      </div>

      <div className="unit-toggle">
        <span className={unit === 'metric' ? 'active' : ''}>Metric</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={unit === 'imperial'} 
            onChange={switchUnit} 
          />
          <span className="slider round"></span>
        </label>
        <span className={unit === 'imperial' ? 'active' : ''}>Imperial</span>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label>Gender:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
              />
              Female
            </label>
          </div>
        </div>

        <div className="form-group col-md-6">
          <label htmlFor="age">Age</label>
          <input
            type="text"
            id="age"
            value={age}
            onChange={handleAgeChange}
            placeholder="Years"
            className={`form-control ${!validAge ? 'invalid' : ''}`}
          />
          {!validAge && <div className="validation-error">Age is required</div>}
        </div>

        <div className="form-group col-md-6">
          <label htmlFor="weight">Weight</label>
          <div className="input-group">
            <input
              type="text"
              id="weight"
              value={weight}
              onChange={handleWeightChange}
              placeholder={unit === 'metric' ? 'kg' : 'lbs'}
              className={`form-control ${!validWeight ? 'invalid' : ''}`}
            />
            <div className="input-group-append">
              <span className="input-group-text">{unit === 'metric' ? 'kg' : 'lbs'}</span>
            </div>
          </div>
          {!validWeight && <div className="validation-error">Weight is required</div>}
        </div>

        <div className="form-group col-md-6">
          <label htmlFor="height">Height</label>
          <div className="input-group">
            <input
              type="text"
              id="height"
              value={heightCm}
              onChange={handleHeightChange}
              placeholder={unit === 'metric' ? 'cm' : 'inches'}
              className={`form-control ${!validHeight ? 'invalid' : ''}`}
            />
            <div className="input-group-append">
              <span className="input-group-text">{unit === 'metric' ? 'cm' : 'in'}</span>
            </div>
          </div>
          {!validHeight && <div className="validation-error">Height is required</div>}
        </div>

        <div className="form-group col-md-6">
          <label htmlFor="neck">Neck</label>
          <div className="input-group">
            <input
              type="text"
              id="neck"
              value={neck}
              onChange={handleNeckChange}
              placeholder={unit === 'metric' ? 'cm' : 'inches'}
              className={`form-control ${!validNeck ? 'invalid' : ''}`}
            />
            <div className="input-group-append">
              <span className="input-group-text">{unit === 'metric' ? 'cm' : 'in'}</span>
            </div>
          </div>
          {neck === '' && <div className="validation-error">Neck measurement is required</div>}
          {neck !== '' && !validNeck && <div className="validation-error">Please enter a valid number</div>}
        </div>

        <div className="form-group col-md-6">
          <label htmlFor="waist">Waist</label>
          <div className="input-group">
            <input
              type="text"
              id="waist"
              value={waist}
              onChange={handleWaistChange}
              placeholder={unit === 'metric' ? 'cm' : 'inches'}
              className={`form-control ${!validWaist ? 'invalid' : ''}`}
            />
            <div className="input-group-append">
              <span className="input-group-text">{unit === 'metric' ? 'cm' : 'in'}</span>
            </div>
          </div>
          {waist === '' && <div className="validation-error">Waist measurement is required</div>}
          {waist !== '' && !validWaist && <div className="validation-error">Please enter a valid number</div>}
        </div>

        {gender === 'female' && (
          <div className="form-group col-md-6">
            <label htmlFor="hip">Hip</label>
            <div className="input-group">
              <input
                type="text"
                id="hip"
                value={hip}
                onChange={handleHipChange}
                placeholder={unit === 'metric' ? 'cm' : 'inches'}
                className={`form-control ${!validHip ? 'invalid' : ''}`}
              />
              <div className="input-group-append">
                <span className="input-group-text">{unit === 'metric' ? 'cm' : 'in'}</span>
              </div>
            </div>
            {hip === '' && <div className="validation-error">Hip measurement is required for women</div>}
            {hip !== '' && !validHip && <div className="validation-error">Please enter a valid number</div>}
          </div>
        )}

        {estimationMethod === 'navy' ? (
          <button 
            className="calculate-button" 
            onClick={calculateBodyFat}
            disabled={!validAge || !validWeight || !validHeight || !validNeck || !validWaist || (gender === 'female' && !validHip)}
          >
            Calculate Body Fat
          </button>
        ) : (
          <div className="visual-slider">
            <h3>Select your estimated body fat percentage:</h3>
            <div className="slider-container">
              <input
                type="range"
                min="3"
                max={gender === 'male' ? "35" : "45"}
                value={sliderValue}
                onChange={handleSliderChange}
                className="slider"
              />
              <div className="slider-labels">
                <span>Low</span>
                <span>{sliderValue}%</span>
                <span>High</span>
              </div>
            </div>
            <div className="slider-visuals">
              <div className="body-images">
                {/* Images would be replaced with actual body type reference images */}
                <img src="placeholder-for-body-image" alt="Body reference" />
              </div>
            </div>
          </div>
        )}

        {bodyFat !== null && (
          <div className="results">
            <h3>Your Results</h3>
            <div className="result-card">
              <div className="result-value">{bodyFat}%</div>
              <div className="result-label">Body Fat</div>
            </div>
            <div className="result-card">
              <div className="result-value">{fitnessLevel}</div>
              <div className="result-label">Fitness Level</div>
            </div>
            
            <div className="healthy-range">
              <h4>Healthy Range for {gender === 'male' ? 'Men' : 'Women'}</h4>
              <div className="range-bar">
                <div className="range-segment essential">Essential</div>
                <div className="range-segment athlete">Athlete</div>
                <div className="range-segment fitness">Fitness</div>
                <div className="range-segment average">Average</div>
                <div className="range-segment obese">Obese</div>
                <div 
                  className="range-marker"
                  style={{ left: `${(bodyFat / (gender === 'male' ? 35 : 45)) * 100}%` }}
                ></div>
              </div>
              <div className="range-labels">
                <span>{bodyFatRanges[gender].essential}%</span>
                <span>{bodyFatRanges[gender].athlete.max}%</span>
                <span>{bodyFatRanges[gender].fitness.max}%</span>
                <span>{bodyFatRanges[gender].average.max}%</span>
                <span>{gender === 'male' ? '35%+' : '45%+'}</span>
              </div>
            </div>

            <button className="reset-button" onClick={resetForm}>
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyFatEstimator;