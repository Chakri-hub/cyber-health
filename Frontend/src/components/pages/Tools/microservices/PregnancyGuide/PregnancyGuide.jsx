import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Container,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './PregnancyGuide.css';

const PregnancyGuide = () => {
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const pregnancyWeeks = [
    {
      trimester: "First Trimester (Weeks 1-12)",
      weeks: [
        {
          week: "Weeks 1-4",
          development: "Fertilization occurs and the embryo implants in the uterus. The neural tube begins to form.",
          changes: "You may not know you're pregnant yet. Early signs include missed period, fatigue, and nausea.",
          tips: "Start taking prenatal vitamins with folic acid if planning pregnancy."
        },
        {
          week: "Weeks 5-8",
          development: "The embryo's heart begins to beat. Brain, spinal cord, and organs start forming.",
          changes: "Morning sickness may begin. Fatigue and breast tenderness are common.",
          tips: "Stay hydrated and eat small, frequent meals to manage nausea."
        },
        {
          week: "Weeks 9-12",
          development: "The embryo is now called a fetus. Fingers, toes, and facial features develop.",
          changes: "The uterus expands but isn't visible yet. Morning sickness may peak.",
          tips: "Schedule your first prenatal checkup if you haven't already."
        }
      ]
    },
    {
      trimester: "Second Trimester (Weeks 13-26)",
      weeks: [
        {
          week: "Weeks 13-16",
          development: "The fetus can make facial expressions. Fingerprints form.",
          changes: "Morning sickness typically improves. You may start showing.",
          tips: "This is a good time to start pregnancy exercises like prenatal yoga."
        },
        {
          week: "Weeks 17-20",
          development: "Baby's movements become noticeable. Gender can usually be determined.",
          changes: "You'll feel the baby move ('quickening'). The pregnancy bump becomes visible.",
          tips: "Schedule your mid-pregnancy ultrasound (anatomy scan)."
        },
        {
          week: "Weeks 21-26",
          development: "The fetus develops a sleep-wake cycle. Lungs continue developing.",
          changes: "Weight gain increases. You may experience back pain and heartburn.",
          tips: "Sleep on your side, preferably left side, to improve blood flow."
        }
      ]
    },
    {
      trimester: "Third Trimester (Weeks 27-40)",
      weeks: [
        {
          week: "Weeks 27-30",
          development: "Baby gains weight and can open eyes. Brain development accelerates.",
          changes: "Shortness of breath and frequent urination are common.",
          tips: "Start planning for labor and delivery. Consider taking childbirth classes."
        },
        {
          week: "Weeks 31-34",
          development: "The baby's immune system develops. Gains about half a pound each week.",
          changes: "Difficulty sleeping, Braxton Hicks contractions may occur.",
          tips: "Prepare a hospital bag and finalize your birth plan."
        },
        {
          week: "Weeks 35-40",
          development: "Baby gets into birth position. Lungs fully mature around week 37.",
          changes: "Increased pressure on pelvis as baby drops. Look for signs of labor.",
          tips: "Rest as much as possible and be alert for signs of labor."
        }
      ]
    }
  ];

  return (
    <Container className="pregnancy-guide-container">
      <Typography variant="h4" align="center" gutterBottom className="title">
        Pregnancy Week-by-Week Guide
      </Typography>
      <Typography variant="body1" paragraph className="intro-text">
        This guide provides an overview of fetal development, body changes, and helpful tips for each stage of pregnancy.
        Remember that every pregnancy is unique, and this information is meant as a general guide.
      </Typography>

      <Divider className="divider" />

      {pregnancyWeeks.map((trimester, index) => (
        <Box key={index} className="trimester-box">
          <Typography variant="h5" className="trimester-title">
            {trimester.trimester}
          </Typography>

          {trimester.weeks.map((weekData, weekIndex) => (
            <Accordion 
              key={weekIndex} 
              expanded={expanded === `${index}-${weekIndex}`} 
              onChange={handleAccordionChange(`${index}-${weekIndex}`)}
              className="week-accordion"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="accordion-summary"
              >
                <Typography variant="h6">{weekData.week}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card className="info-card">
                      <CardContent>
                        <Typography variant="h6" className="card-title">
                          Baby Development
                        </Typography>
                        <Typography variant="body2">
                          {weekData.development}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card className="info-card">
                      <CardContent>
                        <Typography variant="h6" className="card-title">
                          Body Changes
                        </Typography>
                        <Typography variant="body2">
                          {weekData.changes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card className="info-card">
                      <CardContent>
                        <Typography variant="h6" className="card-title">
                          Tips & Advice
                        </Typography>
                        <Typography variant="body2">
                          {weekData.tips}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      <Box className="disclaimer-box" mt={4}>
        <Typography variant="body2" color="textSecondary">
          <strong>Disclaimer:</strong> This guide is for informational purposes only and should not replace medical advice. 
          Always consult your healthcare provider for personalized recommendations during pregnancy.
        </Typography>
      </Box>
    </Container>
  );
};

export default PregnancyGuide; 