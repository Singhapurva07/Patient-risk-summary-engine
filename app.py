from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Groq client
try:
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    print("✅ Groq API initialized successfully")
except Exception as e:
    print(f"❌ Groq API initialization failed: {str(e)}")
    client = None

@app.route('/api/analyze-manual', methods=['POST'])
def analyze_manual():
    """Analyze manually entered patient data using Groq AI"""
    if not client:
        return jsonify({
            "success": False,
            "error": "Groq API not configured. Check GROQ_API_KEY in .env file"
        }), 500
    
    data = request.json
    patient = data.get('patient')
    
    if not patient:
        return jsonify({"success": False, "error": "Patient data required"}), 400
    
    try:
        # Build comprehensive prompt
        conditions_str = ', '.join(patient['conditions']) if patient['conditions'] else 'None reported'
        medications_str = ', '.join(patient['medications']) if patient['medications'] else 'None'
        allergies_str = ', '.join(patient['allergies']) if patient['allergies'] else 'None known'
        
        # Format labs data
        labs_data = []
        if patient['labs'].get('hba1c'):
            labs_data.append(f"HbA1c: {patient['labs']['hba1c']}%")
        if patient['labs'].get('ldl'):
            labs_data.append(f"LDL: {patient['labs']['ldl']} mg/dL")
        if patient['labs'].get('hdl'):
            labs_data.append(f"HDL: {patient['labs']['hdl']} mg/dL")
        if patient['labs'].get('creatinine'):
            labs_data.append(f"Creatinine: {patient['labs']['creatinine']} mg/dL")
        if patient['labs'].get('egfr'):
            labs_data.append(f"eGFR: {patient['labs']['egfr']} mL/min")
        if patient['labs'].get('glucose'):
            labs_data.append(f"Glucose: {patient['labs']['glucose']} mg/dL")
        
        labs_str = ', '.join(labs_data) if labs_data else 'No labs available'

        prompt = f"""You are an expert clinical AI physician. Analyze this patient comprehensively and provide a detailed risk assessment.

PATIENT INFORMATION:
Name: {patient['name']}
Age: {patient['age']} years
Gender: {patient['gender']}

MEDICAL CONDITIONS:
{conditions_str}

VITAL SIGNS:
- Blood Pressure: {patient['vitals']['systolic_bp']}/{patient['vitals']['diastolic_bp']} mmHg
- Heart Rate: {patient['vitals']['heart_rate']} bpm
- SpO2: {patient['vitals']['spo2']}%
- Temperature: {patient['vitals']['temperature']}°F
- Weight: {patient['vitals']['weight']} lbs
- Height: {patient['vitals']['height']} inches
- BMI: {round(patient['vitals']['weight'] / (patient['vitals']['height'] ** 2) * 703, 1)} kg/m²

LABORATORY RESULTS:
{labs_str}

MEDICATIONS:
{medications_str}

SOCIAL HISTORY:
- Smoking: {'Yes - Active smoker' if patient['smoking'] else 'Non-smoker'}
- Alcohol: {patient['alcohol']}
- Allergies: {allergies_str}

Provide a comprehensive risk assessment in VALID JSON format with this EXACT structure:
{{
  "overallRiskScore": 75,
  "riskCategory": "High",
  "domains": {{
    "cardiac": {{
      "score": 80,
      "status": "red",
      "concerns": ["Elevated blood pressure indicates Stage 2 Hypertension", "Increased cardiovascular disease risk"],
      "recommendations": ["Initiate or intensify antihypertensive therapy", "Cardiology consultation within 2 weeks", "Daily home BP monitoring"]
    }},
    "respiratory": {{
      "score": 65,
      "status": "yellow",
      "concerns": ["SpO2 slightly below optimal range", "Possible hypoxemia risk"],
      "recommendations": ["Pulmonary function test", "Consider supplemental oxygen", "Monitor respiratory rate"]
    }},
    "metabolic": {{
      "score": 70,
      "status": "yellow",
      "concerns": ["HbA1c above target indicating poor glycemic control", "Dyslipidemia present"],
      "recommendations": ["Adjust diabetes medications", "Dietary counseling with nutritionist", "Increase exercise regimen"]
    }},
    "renal": {{
      "score": 60,
      "status": "yellow",
      "concerns": ["Elevated creatinine suggesting kidney dysfunction", "Reduced eGFR indicating CKD Stage 3"],
      "recommendations": ["Nephrology consultation", "Avoid nephrotoxic medications", "Monitor kidney function quarterly"]
    }}
  }},
  "comorbidityRisk": "This patient presents with multiple interacting chronic conditions that synergistically increase overall health risk. The combination of cardiovascular disease, metabolic syndrome, and renal impairment requires coordinated multi-system management to prevent acute decompensation.",
  "priorityActions": [
    {{
      "action": "Optimize blood pressure control immediately",
      "urgency": "high",
      "impact": "Reducing BP to target range can decrease cardiovascular event risk by 30-40% and slow progression of kidney disease",
      "timeframe": "Within 1-2 weeks"
    }},
    {{
      "action": "Intensify diabetes management and achieve HbA1c target",
      "urgency": "high",
      "impact": "Preventing microvascular complications including retinopathy, nephropathy, and neuropathy. Each 1% reduction in HbA1c reduces complications by 25%",
      "timeframe": "Within 1 month"
    }},
    {{
      "action": "Schedule comprehensive cardiology evaluation",
      "urgency": "medium",
      "impact": "Assess for underlying coronary artery disease and optimize cardiac medications to prevent heart failure or MI",
      "timeframe": "Within 4-6 weeks"
    }}
  ],
  "hospitalAdmissionProb": 35,
  "readmissionRisk30Day": 28,
  "treatmentResponseLikelihood": 70,
  "milestones": [
    {{
      "task": "Recheck HbA1c and fasting glucose",
      "date": "3 months",
      "priority": "high"
    }},
    {{
      "task": "Repeat comprehensive metabolic panel and lipid panel",
      "date": "3 months",
      "priority": "high"
    }},
    {{
      "task": "Follow-up renal function tests (Creatinine, eGFR)",
      "date": "3 months",
      "priority": "high"
    }},
    {{
      "task": "Blood pressure recheck and medication adjustment",
      "date": "2 weeks",
      "priority": "high"
    }},
    {{
      "task": "Cardiology consultation appointment",
      "date": "4-6 weeks",
      "priority": "medium"
    }}
  ],
  "clinicalSummary": "This {patient['age']}-year-old {patient['gender'].lower()} patient presents with significant multi-system health challenges requiring intensive disease management. Primary concerns include inadequately controlled hypertension, metabolic dysregulation, and early chronic kidney disease. Immediate intervention is necessary to prevent progression to end-stage complications.",
  "keyFindings": [
    "Blood pressure {patient['vitals']['systolic_bp']}/{patient['vitals']['diastolic_bp']} mmHg indicating Stage 2 Hypertension - immediate treatment adjustment required",
    "Multiple chronic conditions creating synergistic risk for adverse cardiovascular events",
    "Evidence of early organ damage requiring prompt specialist evaluation and coordinated care management"
  ]
}}

IMPORTANT: 
- Score domains from 0-100 (0=no risk, 100=critical risk)
- Use "red" status for scores 60+, "yellow" for 30-59, "green" for <30
- Provide specific, actionable recommendations
- Base risk scores on actual vital signs and lab values provided
- Return ONLY valid JSON, no markdown, no explanations."""

        print(f"📄 Analyzing patient {patient['name']}...")
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical risk assessment AI. Always respond with valid JSON only. No markdown formatting. Base your analysis on the specific vital signs, lab values, and conditions provided."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=3000
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Clean up response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse JSON
        analysis = json.loads(response_text)
        
        print(f"✅ Analysis complete for {patient['name']}")
        
        return jsonify({
            "success": True,
            "analysis": analysis,
            "patient": patient,
            "timestamp": datetime.now().isoformat()
        })
        
    except json.JSONDecodeError as je:
        print(f"❌ JSON Parse Error: {str(je)}")
        print(f"Response was: {response_text[:200]}...")
        return jsonify({
            "success": False,
            "error": f"Invalid JSON response from AI: {str(je)}"
        }), 500
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "groq_api_configured": bool(os.getenv('GROQ_API_KEY')),
        "groq_client_initialized": client is not None
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Patient Risk Summary Engine Backend")
    print("="*50)
    print(f"✅ Server starting on http://localhost:5000")
    print(f"✅ CORS enabled for frontend")
    
    if os.getenv('GROQ_API_KEY'):
        print(f"✅ Groq API Key found")
    else:
        print(f"❌ WARNING: GROQ_API_KEY not found in .env file!")
        print(f"   Create a .env file with: GROQ_API_KEY=your_key_here")
    
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)