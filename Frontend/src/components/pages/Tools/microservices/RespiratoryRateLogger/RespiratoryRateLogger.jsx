import React from 'react';
import './RespiratoryRateLogger.css';

const RespiratoryRateLogger = () => {
    return (
        <div className="respiratory-rate-logger">
            <div className="respiratory-header">
                <h1>Respiratory Rate Logger</h1>
                <p>Count and record your breathing rate</p>
            </div>

            <div className="instructions-section">
                <h2>How to Measure Respiratory Rate</h2>
                <div className="instruction-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Find a Comfortable Position</h3>
                        <p>Sit or lie down in a comfortable position. Make sure you're relaxed and breathing normally.</p>
                    </div>
                </div>
                <div className="instruction-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Count Your Breaths</h3>
                        <p>Count the number of times your chest rises over the period of one minute (one rise and fall counts as one breath).</p>
                    </div>
                </div>
                <div className="instruction-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Understand Your Results</h3>
                        <div className="rate-categories">
                            <div className="rate-category normal">
                                <h4>Normal Range (Adults)</h4>
                                <p>12-20 breaths per minute</p>
                            </div>
                            <div className="rate-category below">
                                <h4>Below Normal</h4>
                                <p>Less than 12 breaths per minute</p>
                                <p>May indicate respiratory depression, which could be caused by certain medications or conditions</p>
                            </div>
                            <div className="rate-category above">
                                <h4>Above Normal</h4>
                                <p>More than 20 breaths per minute</p>
                                <p>May indicate respiratory distress, fever, anxiety, or other medical conditions</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="instruction-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                        <h3>Important Notes</h3>
                        <ul className="important-notes">
                            <li>Try to count your breaths without changing your breathing pattern. Being aware of your breathing may cause you to alter it.</li>
                            <li>For the most accurate results, have someone else count your breaths while you're not aware of it.</li>
                            <li>Consult a healthcare professional if your respiratory rate is consistently outside the normal range.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RespiratoryRateLogger; 