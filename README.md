# Patient-risk-summary-engine
AI-Powered Clinical Decision Support System (CDSS)

## Overview

The **Patient Risk Summary Engine** is an AI-powered **Clinical Decision Support System (CDSS)** designed to assist clinicians in evaluating patient health risks by analyzing demographics, medical history, vital signs, laboratory results, medications, and social factors.

The system provides **interpretable, multi-system risk stratification** and **evidence-informed clinical insights** to support physician decision-making. It is intended strictly as an **assistive tool** and does not provide diagnoses or treatment directives.

---

## Key Features

- Multi-system health risk assessment (Cardiac, Metabolic, Renal, Respiratory)
- Patient-context-aware analysis using vitals, labs, and medical history
- Overall and domain-specific risk scoring (0–100 scale)
- Priority-based action planning with timelines
- Clinician-oriented summaries and follow-up schedules
- Explainable outputs suitable for real-world clinical workflows
- Human-in-the-loop design aligned with CDSS principles

---

## Supported Clinical Inputs

### Patient Demographics
- Age
- Gender

### Medical History
- Chronic conditions (e.g., hypertension, diabetes, dyslipidemia)
- Allergies
- Social history (smoking, alcohol use)

### Vital Signs
- Blood pressure (systolic, diastolic)
- Heart rate
- Oxygen saturation (SpO₂)
- Temperature
- Height and weight

### Laboratory Results (Optional)
- HbA1c
- LDL / HDL cholesterol
- Serum creatinine
- Estimated GFR
- Blood glucose

### Medications
- Current pharmacotherapy (free-text)

---

## System Outputs

- **Overall Health Risk Score** with categorical interpretation
- **System-Specific Risk Breakdown** across major organ systems
- Key clinical concerns derived from patient data
- Evidence-informed recommendations for physician consideration
- Priority action plan with expected impact and timeframe
- Follow-up schedule for monitoring and reassessment
- Risk projections (hospital admission, readmission, treatment response)

---

## Clinical Design Principles

- Non-diagnostic and non-prescriptive
- Physician oversight required for all decisions
- Emphasis on explainability and transparency
- Designed to augment, not replace, clinical judgment
- Conservative language aligned with healthcare AI ethics

---

## Technology Stack

### Frontend
- React
- Vite
- Component-based UI with real-time validation

### Backend
- Python
- Flask
- RESTful API architecture

### AI & Logic Layer
- Rule-based clinical thresholding
- Deterministic scoring logic
- LLM-assisted narrative generation (Groq)
- No autonomous or agentic behavior

---

## Example Use Cases

- Outpatient clinic risk stratification
- Early identification of multi-morbidity risk
- Chronic disease monitoring support
- Clinical education and training
- Hackathons and academic demonstrations

---

## Ethical & Safety Notice

This system is a **Clinical Decision Support Tool** and:

- Does not provide diagnoses
- Does not prescribe treatments
- Does not act autonomously
- Requires clinician review and judgment

All outputs are intended for **informational and decision-support purposes only**.

---

## Project Status

- Functional prototype
- Intended for hackathons, demonstrations, and academic evaluation
- Not approved for clinical deployment
- Further validation required for real-world use

---

## Running the Project

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py


