import React, { useState } from 'react';
import { Heart, Activity, AlertTriangle, TrendingUp, Calendar, FileText, User, Droplet, Thermometer, Wind } from 'lucide-react';

const API_URL = 'http://localhost:5000';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    conditions: [],
    newCondition: '',
    systolic_bp: '',
    diastolic_bp: '',
    heart_rate: '',
    temperature: '',
    spo2: '',
    weight: '',
    height: '',
    hba1c: '',
    ldl: '',
    hdl: '',
    creatinine: '',
    egfr: '',
    glucose: '',
    medications: [],
    newMedication: '',
    allergies: [],
    newAllergy: '',
    smoking: false,
    alcohol: 'None'
  });

  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addItem = (field, newItemField) => {
    if (formData[newItemField].trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], prev[newItemField]],
        [newItemField]: ''
      }));
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const analyzeRisk = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            conditions: formData.conditions,
            vitals: {
              systolic_bp: parseInt(formData.systolic_bp),
              diastolic_bp: parseInt(formData.diastolic_bp),
              heart_rate: parseInt(formData.heart_rate),
              temperature: parseFloat(formData.temperature),
              spo2: parseInt(formData.spo2),
              weight: parseInt(formData.weight),
              height: parseInt(formData.height)
            },
            labs: {
              hba1c: parseFloat(formData.hba1c) || null,
              ldl: parseInt(formData.ldl) || null,
              hdl: parseInt(formData.hdl) || null,
              creatinine: parseFloat(formData.creatinine) || null,
              egfr: parseInt(formData.egfr) || null,
              glucose: parseInt(formData.glucose) || null
            },
            medications: formData.medications,
            allergies: formData.allergies,
            smoking: formData.smoking,
            alcohol: formData.alcohol
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setRiskAnalysis(data.analysis);
        setShowResults(true);
      } else {
        setError(`Analysis failed: ${data.error}`);
      }
    } catch (err) {
      setError('❌ Cannot connect to backend! Make sure to run: python app.py');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#10B981';
    if (score < 60) return '#FBBF24';
    return '#EF4444';
  };

  const getRiskBg = (score) => {
    if (score < 30) return '#D1FAE5';
    if (score < 60) return '#FEF3C7';
    return '#FEE2E2';
  };

  const getRiskLabel = (score) => {
    if (score < 30) return 'LOW RISK';
    if (score < 60) return 'MODERATE RISK';
    return 'HIGH RISK';
  };

  const getStatusColor = (status) => {
    if (status === 'green') return '#10B981';
    if (status === 'yellow') return '#FBBF24';
    return '#EF4444';
  };

  if (showResults && riskAnalysis) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6', padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1F2937' }}>
                Risk Analysis Report
              </h1>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                Patient: {formData.name} • Age {formData.age} • {formData.gender}
              </p>
            </div>
            <button
              onClick={() => {
                setShowResults(false);
                setRiskAnalysis(null);
              }}
              style={{
                background: '#6366F1',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ← New Analysis
            </button>
          </div>

          {/* Overall Risk Score - Large Display */}
          <div style={{
            background: getRiskBg(riskAnalysis.overallRiskScore),
            border: `4px solid ${getRiskColor(riskAnalysis.overallRiskScore)}`,
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>
              OVERALL HEALTH RISK SCORE
            </p>
            <div style={{
              fontSize: '120px',
              fontWeight: '900',
              color: getRiskColor(riskAnalysis.overallRiskScore),
              lineHeight: '1',
              marginBottom: '16px'
            }}>
              {riskAnalysis.overallRiskScore}
            </div>
            <div style={{
              display: 'inline-block',
              background: getRiskColor(riskAnalysis.overallRiskScore),
              color: 'white',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '16px'
            }}>
              {getRiskLabel(riskAnalysis.overallRiskScore)}
            </div>
            <p style={{
              fontSize: '18px',
              color: '#374151',
              fontWeight: '600',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {riskAnalysis.clinicalSummary}
            </p>
          </div>

          {/* Domain Risk Analysis */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>
              🏥 System-Specific Risk Breakdown
            </h2>

            {Object.entries(riskAnalysis.domains).map(([domain, data]) => (
              <div key={domain} style={{
                marginBottom: '32px',
                padding: '24px',
                background: getRiskBg(data.score),
                border: `2px solid ${getRiskColor(data.score)}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: getStatusColor(data.status)
                    }}></div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      margin: 0,
                      textTransform: 'uppercase',
                      color: '#1F2937'
                    }}>
                      {domain}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: getRiskColor(data.score),
                      lineHeight: '1'
                    }}>
                      {data.score}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#6B7280'
                    }}>
                      / 100
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '20px',
                  background: '#E5E7EB',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: `${data.score}%`,
                    height: '100%',
                    background: getRiskColor(data.score),
                    transition: 'width 1s ease'
                  }}></div>
                </div>

                {/* Concerns */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#DC2626',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    ⚠️ Key Concerns:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {data.concerns.map((concern, idx) => (
                      <li key={idx} style={{
                        color: '#374151',
                        fontSize: '15px',
                        marginBottom: '6px',
                        fontWeight: '500'
                      }}>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#059669',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    ✅ Recommended Actions:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {data.recommendations.map((rec, idx) => (
                      <li key={idx} style={{
                        color: '#374151',
                        fontSize: '15px',
                        marginBottom: '6px',
                        fontWeight: '500'
                      }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Priority Actions */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>
              🎯 Priority Action Plan
            </h2>

            {riskAnalysis.priorityActions.map((action, idx) => {
              const urgencyColor = action.urgency === 'high' ? '#DC2626' : 
                                   action.urgency === 'medium' ? '#F59E0B' : '#3B82F6';
              const urgencyBg = action.urgency === 'high' ? '#FEE2E2' : 
                                action.urgency === 'medium' ? '#FEF3C7' : '#DBEAFE';

              return (
                <div key={idx} style={{
                  background: urgencyBg,
                  border: `3px solid ${urgencyColor}`,
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#1F2937' }}>
                      {idx + 1}. {action.action}
                    </h3>
                    <span style={{
                      background: urgencyColor,
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}>
                      {action.urgency} PRIORITY
                    </span>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <p style={{ margin: 0, fontSize: '15px', color: '#374151', fontWeight: '600' }}>
                      <strong>Expected Impact:</strong> {action.impact}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px'
                  }}>
                    <Calendar size={18} color={urgencyColor} />
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#374151' }}>
                      Timeframe: {action.timeframe}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Predictions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #F59E0B'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#92400E', marginBottom: '16px' }}>
                HOSPITAL ADMISSION RISK
              </p>
              <div style={{ fontSize: '64px', fontWeight: '900', color: '#F59E0B', lineHeight: '1' }}>
                {riskAnalysis.hospitalAdmissionProb}%
              </div>
              <p style={{ fontSize: '13px', color: '#92400E', marginTop: '12px', fontWeight: '600' }}>
                Near-term probability
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #DC2626'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B', marginBottom: '16px' }}>
                30-DAY READMISSION
              </p>
              <div style={{ fontSize: '64px', fontWeight: '900', color: '#DC2626', lineHeight: '1' }}>
                {riskAnalysis.readmissionRisk30Day}%
              </div>
              <p style={{ fontSize: '13px', color: '#991B1B', marginTop: '12px', fontWeight: '600' }}>
                Return probability
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #10B981'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#065F46', marginBottom: '16px' }}>
                TREATMENT SUCCESS
              </p>
              <div style={{ fontSize: '64px', fontWeight: '900', color: '#10B981', lineHeight: '1' }}>
                {riskAnalysis.treatmentResponseLikelihood}%
              </div>
              <p style={{ fontSize: '13px', color: '#065F46', marginTop: '12px', fontWeight: '600' }}>
                Response likelihood
              </p>
            </div>
          </div>

          {/* Key Findings */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>
              🔍 Key Clinical Findings
            </h2>
            {riskAnalysis.keyFindings.map((finding, idx) => (
              <div key={idx} style={{
                background: '#FEF3C7',
                border: '2px solid #FCD34D',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                display: 'flex',
                gap: '12px'
              }}>
                <AlertTriangle size={24} color="#F59E0B" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '15px', color: '#92400E', fontWeight: '600' }}>
                  {finding}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>
              📅 Follow-up Schedule
            </h2>
            <div style={{ position: 'relative', paddingLeft: '40px' }}>
              {riskAnalysis.milestones.map((milestone, idx) => {
                const priorityColor = milestone.priority === 'high' ? '#DC2626' : 
                                     milestone.priority === 'medium' ? '#F59E0B' : '#3B82F6';
                return (
                  <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-40px',
                      top: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: priorityColor,
                      border: '4px solid white',
                      boxShadow: '0 0 0 2px #E5E7EB'
                    }}></div>

                    {idx < riskAnalysis.milestones.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '-29px',
                        top: '32px',
                        width: '2px',
                        height: 'calc(100% - 8px)',
                        background: '#E5E7EB'
                      }}></div>
                    )}

                    <div style={{
                      background: '#F9FAFB',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                          {milestone.task}
                        </h4>
                        <span style={{
                          background: priorityColor,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {milestone.priority.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0', fontWeight: '600' }}>
                        📅 Due: {milestone.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <Heart size={48} color="#667eea" style={{ margin: '0 auto 16px' }} />
          <h1 style={{
            fontSize: '42px',
            fontWeight: '900',
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Patient Risk Summary Engine
          </h1>
          <p style={{ color: '#6B7280', fontSize: '18px', marginTop: '8px' }}>
            Enter patient details for AI-powered risk analysis
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '2px solid #FCA5A5',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px'
          }}>
            <AlertTriangle size={24} color="#DC2626" />
            <div>
              <p style={{ color: '#991B1B', fontWeight: '600', margin: 0 }}>{error}</p>
              <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '8px' }}>
                Make sure backend is running: <code>python app.py</code>
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '80px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '6px solid #E5E7EB',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 32px'
            }}></div>
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              🤖 AI Analyzing Patient Data
            </h3>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>
              Comprehensive risk assessment in progress...
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Patient Demographics */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={28} color="#667eea" />
                Patient Demographics
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="65"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Conditions */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={28} color="#EF4444" />
                Medical Conditions
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  name="newCondition"
                  value={formData.newCondition}
                  onChange={handleInputChange}
                  placeholder="e.g., Hypertension, Diabetes, COPD"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}
                />
                <button
                  onClick={() => addItem('conditions', 'newCondition')}
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#FEE2E2',
                      color: '#991B1B',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => removeItem('conditions', idx)}
                  >
                    {cond} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Vital Signs */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={28} color="#F59E0B" />
                Vital Signs
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Systolic BP *
                  </label>
                  <input
                    type="number"
                    name="systolic_bp"
                    value={formData.systolic_bp}
                    onChange={handleInputChange}
                    placeholder="120"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Diastolic BP *
                  </label>
                  <input
                    type="number"
                    name="diastolic_bp"
                    value={formData.diastolic_bp}
                    onChange={handleInputChange}
                    placeholder="80"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Heart Rate *
                  </label>
                  <input
                    type="number"
                    name="heart_rate"
                    value={formData.heart_rate}
                    onChange={handleInputChange}
                    placeholder="72"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    SpO2 (%) *
                  </label>
                  <input
                    type="number"
                    name="spo2"
                    value={formData.spo2}
                    onChange={handleInputChange}
                    placeholder="98"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Temperature (°F) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="98.6"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="180"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Height (inches) *
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="70"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Laboratory Results */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Droplet size={28} color="#3B82F6" />
                Laboratory Results (Optional)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    HbA1c (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="hba1c"
                    value={formData.hba1c}
                    onChange={handleInputChange}
                    placeholder="7.5"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    LDL (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="ldl"
                    value={formData.ldl}
                    onChange={handleInputChange}
                    placeholder="130"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    HDL (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="hdl"
                    value={formData.hdl}
                    onChange={handleInputChange}
                    placeholder="45"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Creatinine (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="creatinine"
                    value={formData.creatinine}
                    onChange={handleInputChange}
                    placeholder="1.2"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    eGFR (mL/min)
                  </label>
                  <input
                    type="number"
                    name="egfr"
                    value={formData.egfr}
                    onChange={handleInputChange}
                    placeholder="60"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="glucose"
                    value={formData.glucose}
                    onChange={handleInputChange}
                    placeholder="120"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Medications */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937' }}>
                💊 Current Medications
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  name="newMedication"
                  value={formData.newMedication}
                  onChange={handleInputChange}
                  placeholder="e.g., Metformin 1000mg BID"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}
                />
                <button
                  onClick={() => addItem('medications', 'newMedication')}
                  style={{
                    background: '#3B82F6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.medications.map((med, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#DBEAFE',
                      color: '#1E40AF',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => removeItem('medications', idx)}
                  >
                    {med} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Social History */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937' }}>
                🏥 Social History
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F9FAFB', borderRadius: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="smoking"
                      checked={formData.smoking}
                      onChange={handleInputChange}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                      Current Smoker
                    </span>
                  </label>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Alcohol Use
                  </label>
                  <select
                    name="alcohol"
                    value={formData.alcohol}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  >
                    <option value="None">None</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#1F2937' }}>
                ⚠️ Allergies
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  name="newAllergy"
                  value={formData.newAllergy}
                  onChange={handleInputChange}
                  placeholder="e.g., Penicillin, Sulfa drugs"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}
                />
                <button
                  onClick={() => addItem('allergies', 'newAllergy')}
                  style={{
                    background: '#F59E0B',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#FEF3C7',
                      color: '#92400E',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => removeItem('allergies', idx)}
                  >
                    {allergy} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Validation Feedback + Submit Button */}
            {(!formData.name?.trim() ||
              !formData.age ||
              !formData.gender ||
              !formData.systolic_bp ||
              !formData.diastolic_bp ||
              !formData.heart_rate) && (
              <div style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                Please fill in all required fields: Name, Age, Gender, Systolic BP, Diastolic BP, Heart Rate
              </div>
            )}

            <button
              onClick={analyzeRisk}
              disabled={
                !formData.name?.trim() ||
                !formData.age ||
                !formData.gender ||
                !formData.systolic_bp ||
                !formData.diastolic_bp ||
                !formData.heart_rate
              }
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '20px',
                fontWeight: '800',
                cursor: 'pointer',
                opacity: 0.6
              }}
            >
              🤖 ANALYZE PATIENT RISK
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          outline: none;
          border-color: #667eea !important;
        }
      `}</style>
    </div>
  );
}

export default App;