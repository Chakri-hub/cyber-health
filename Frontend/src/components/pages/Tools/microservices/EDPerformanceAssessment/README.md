# ED & Performance Self-Assessment Tool

This component provides users with a comprehensive self-assessment tool for erectile dysfunction (ED) and sexual performance concerns. The tool is designed to help users evaluate their symptoms, identify potential risk factors, and receive personalized recommendations.

## Features

- **Comprehensive Survey**: Assesses erection quality, frequency, and related health factors
- **Health Background Questions**: Identifies potential medical conditions that may contribute to ED
- **Personalized Assessment**: Provides a score and personalized interpretation of results
- **Doctor Visit Recommendations**: Suggests when medical consultation is necessary based on responses
- **Natural Improvement Tips**: Offers evidence-based suggestions for improving sexual health through lifestyle changes
- **Save Results**: Allows authenticated users to save assessment results for future reference

## Implementation Details

The tool consists of three main sections:

1. **Introduction**: Explains the purpose of the assessment and provides privacy information
2. **Survey**: Contains the assessment questions divided into ED-specific questions and health background
3. **Results**: Displays assessment score, interpretation, and personalized recommendations

## Technical Architecture

- Built with React and integrated with Redux for state management
- Uses local storage for saving assessment data for authenticated users
- Implements responsive design for all device sizes
- Utilizes modular component structure for maintainability

## Scoring System

The assessment utilizes a scoring system (0-100) based on weighted responses to determine the severity of ED symptoms and provides appropriate recommendations based on the score range:

- **High (70-100)**: Minimal or no ED symptoms
- **Medium (40-69)**: Mild to moderate ED symptoms
- **Low (0-39)**: Severe ED symptoms

## Privacy Considerations

This tool handles sensitive health information and implements the following privacy measures:

- All assessment data is processed client-side
- Data is only stored locally for authenticated users who opt to save results
- Clear privacy notices are provided to users before assessment begins

## Usage

The component can be integrated into the health tools section of the application and accessed through:

```jsx
import EDPerformanceAssessment from 'components/pages/Tools/microservices/EDPerformanceAssessment/EDPerformanceAssessment';

// Then in your component
<EDPerformanceAssessment />
```

## Customization

The assessment questions, scoring logic, and recommendations can be easily modified in the component code to adapt to different medical guidelines or requirements. 