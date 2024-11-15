import React, { useState, useEffect, useRef, useMemo } from 'react';
import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { FaStar } from 'react-icons/fa';
import { geminiService } from '../services/geminiService';
import { Button, Spinner, Alert } from 'react-bootstrap';
import './JobApplicationForm.css';
import { JobType, JOB_TYPES } from '../types/JobType';

interface JobApplicationFormProps {
    onSubmit: (application: JobApplication) => void;
    formData: Partial<JobApplication>;
    onFormChange: (formData: Partial<JobApplication>) => void;
    existingApplications: JobApplication[];
    onCancel: () => void;
    setIsFormDirty: (isDirty: boolean) => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit, formData, onFormChange, onCancel, setIsFormDirty }) => {
    const today = new Date().toISOString();
    
    const initialFormData = useMemo(() => ({
        ...formData,
        rating: 0,
        statusHistory: [{ status: ApplicationStatus.Bookmarked, timestamp: today }]
    }), [formData, today]);

    const [localFormData, setLocalFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const companyNameInputRef = useRef<HTMLInputElement>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set());
    const [parseError, setParseError] = useState<string | null>(null);
    const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        onFormChange(localFormData);
        const isDirty = JSON.stringify(localFormData) !== JSON.stringify(initialFormData);
        setIsFormDirty(isDirty);
    }, [localFormData, onFormChange, initialFormData, setIsFormDirty]);

    useEffect(() => {
        if (companyNameInputRef.current) {
            companyNameInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (jobDescriptionRef.current) {
            jobDescriptionRef.current.focus();
        }
    }, []);

    useEffect(() => {
        return () => {
            setIsFormDirty(false);
        };
    }, [setIsFormDirty]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'initialStatus') {
            setLocalFormData(prev => ({
                ...prev,
                statusHistory: [{ 
                    status: value as ApplicationStatus, 
                    timestamp: today 
                }]
            }));
        } else {
            if (autofilledFields.has(name)) {
                const newAutofilledFields = new Set(autofilledFields);
                newAutofilledFields.delete(name);
                setAutofilledFields(newAutofilledFields);
            }
            
            setLocalFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRatingChange = (rating: number) => {
        setLocalFormData(prev => ({
            ...prev,
            rating,
            statusHistory: prev.statusHistory || [{ 
                status: ApplicationStatus.Bookmarked, 
                timestamp: new Date().toISOString() 
            }]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!localFormData.companyName) {
            newErrors.companyName = 'Company name is required';
        }
        if (!localFormData.jobTitle) {
            newErrors.jobTitle = 'Job title is required';
        }
        if (!localFormData.statusHistory?.[0]?.timestamp) {
            newErrors.statusHistory = 'Date applied is required';
        }
        
        if (localFormData.jobUrl && !localFormData.jobUrl.match(/^https?:\/\/.+/)) {
            newErrors.jobUrl = 'URL must start with http:// or https://';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsFormDirty(false);
            console.log('Form submitting with data:', localFormData);
            onSubmit(localFormData as JobApplication);
        }
    };

    const handleParseJobDescription = async () => {
        const textToParse = localFormData.jobDescription;
        if (!textToParse?.trim()) return;

        setIsParsing(true);
        setParseError(null);
        
        try {
            const parsePrompt = `
            Analyze this job posting and return ONLY a JSON object with these fields:
            {
                "companyName": "extracted company name",
                "jobTitle": "extracted job title",
                "jobType": "one of: Remote, Hybrid, Onsite, or Unspecified",
                "applicationMethod": "one of: Direct, Email, Seek, LinkedIn, Indeed, or Other",
                "source": "determine if this is from Seek, LinkedIn, Indeed, or other job board",
                "location": "extract city name only (e.g., Melbourne, Sydney, Brisbane)",
                "payRange": "extract salary range if mentioned (e.g., $80,000 - $90,000 per year, or Undisclosed if not mentioned)"
            }
            
            Important: 
            - For jobType, look for mentions of remote work, hybrid arrangements, or onsite/office requirements
            - For applicationMethod, if the job is posted on Seek, use "Seek". If on LinkedIn, use "LinkedIn". 
              If it mentions applying via email, use "Email". If applying directly on company website, use "Direct".
            - For location, only include the city name, not full address
            - For payRange, format as a range if given, or "Undisclosed" if not mentioned
            Return the JSON object only, no markdown formatting or backticks.
            
            Job posting:
            ${textToParse}`;

            const result = await geminiService.generateResponse(parsePrompt, false);
            try {
                const cleanJson = result.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                
                const applicationMethod = parsed.source === 'Seek' ? 'Seek' : 
                                       parsed.source === 'LinkedIn' ? 'LinkedIn' :
                                       parsed.applicationMethod;
                
                const filled = new Set<string>();
                if (parsed.companyName) filled.add('companyName');
                if (parsed.jobTitle) filled.add('jobTitle');
                if (parsed.applicationMethod) filled.add('applicationMethod');
                if (parsed.location) filled.add('location');
                if (parsed.payRange && parsed.payRange !== 'Undisclosed') filled.add('payRange');
                if (parsed.jobType) filled.add('jobType');

                setAutofilledFields(filled);

                setLocalFormData(prev => ({
                    ...prev,
                    companyName: parsed.companyName || prev.companyName,
                    jobTitle: parsed.jobTitle || prev.jobTitle,
                    jobType: parsed.jobType || prev.jobType,
                    applicationMethod: applicationMethod || prev.applicationMethod,
                    location: parsed.location || prev.location,
                    payRange: parsed.payRange === 'Undisclosed' ? '' : (parsed.payRange || prev.payRange),
                }));
            } catch (parseError) {
                setParseError('Could not extract job details. Please check the job description or try adding the details manually.');
                console.error('Failed to parse AI response as JSON:', result);
            }
        } catch (error) {
            setParseError(error instanceof Error ? error.message : 'Failed to parse job description');
            console.error('Failed to parse job description:', error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleCancel = () => {
        setIsFormDirty(false);
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="initialStatus" className="form-label">Initial Status</label>
                <select
                    className="form-control"
                    id="initialStatus"
                    name="initialStatus"
                    value={localFormData.statusHistory?.[0]?.status || ApplicationStatus.Bookmarked}
                    onChange={handleChange}
                >
                    <option value={ApplicationStatus.Bookmarked}>Bookmarked</option>
                    <option value={ApplicationStatus.Applied}>Applied</option>
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="companyName" className="form-label">Company Name</label>
                <input
                    type="text"
                    className={`form-control ${autofilledFields.has('companyName') ? 'field-autofilled' : ''}`}
                    id="companyName"
                    name="companyName"
                    value={localFormData.companyName || ''}
                    onChange={handleChange}
                    required
                />
                {autofilledFields.has('companyName') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
                {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="jobTitle" className="form-label">Job Title</label>
                <input
                    type="text"
                    className={`form-control ${autofilledFields.has('jobTitle') ? 'field-autofilled' : ''}`}
                    id="jobTitle"
                    name="jobTitle"
                    value={localFormData.jobTitle || ''}
                    onChange={handleChange}
                    required
                />
                {autofilledFields.has('jobTitle') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
                {errors.jobTitle && <div className="invalid-feedback">{errors.jobTitle}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="jobType" className="form-label">Job Type</label>
                <select
                    className={`form-control ${autofilledFields.has('jobType') ? 'field-autofilled' : ''}`}
                    id="jobType"
                    name="jobType"
                    value={localFormData.jobType || JobType.Unspecified}
                    onChange={handleChange}
                >
                    {JOB_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                {autofilledFields.has('jobType') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </div>
            <div className="mb-3">
                <label htmlFor="location" className="form-label">
                    Company Location
                    <span className="ms-2 text-muted small">(optional)</span>
                </label>
                <input
                    type="text"
                    className={`form-control ${autofilledFields.has('location') ? 'field-autofilled' : ''}`}
                    id="location"
                    name="location"
                    value={localFormData.location || ''}
                    onChange={handleChange}
                    placeholder="e.g., Melbourne, Sydney"
                />
                {autofilledFields.has('location') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </div>
            <div className="mb-3">
                <label htmlFor="payRange" className="form-label">
                    Pay Range
                    <span className="ms-2 text-muted small">(optional)</span>
                </label>
                <input
                    type="text"
                    className={`form-control ${autofilledFields.has('payRange') ? 'field-autofilled' : ''}`}
                    id="payRange"
                    name="payRange"
                    value={localFormData.payRange || ''}
                    onChange={handleChange}
                    placeholder="e.g., $80,000 - $90,000 per year"
                />
                {autofilledFields.has('payRange') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </div>
            <div className="mb-3">
                <label htmlFor="jobDescription" className="form-label">
                    Job Details
                    <span className="job-description-hint ms-2">
                        💡 Pro tip: Paste the job posting here and click "Extract Job Details"
                    </span>
                </label>
                <textarea
                    ref={jobDescriptionRef}
                    className={`form-control highlight-field`}
                    id="jobDescription"
                    name="jobDescription"
                    value={localFormData.jobDescription || ''}
                    onChange={handleChange}
                    rows={5}
                    maxLength={10000}
                    placeholder="Paste job description here... (max 10,000 characters)"
                    onPaste={() => {
                        setParseError(null);
                        setTimeout(handleParseJobDescription, 100);
                    }}
                />
                {parseError && (
                    <Alert variant="danger" className="mt-2">
                        {parseError}
                    </Alert>
                )}
                <Button 
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={handleParseJobDescription}
                    disabled={!localFormData.jobDescription?.trim() || isParsing}
                >
                    {isParsing ? (
                        <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Extracting...
                        </>
                    ) : (
                        'Extract Job Details'
                    )}
                </Button>
            </div>
            <div className="mb-3">
                <label htmlFor="applicationMethod" className="form-label">Application Method</label>
                <select
                    className={`form-control ${autofilledFields.has('applicationMethod') ? 'field-autofilled' : ''}`}
                    id="applicationMethod"
                    name="applicationMethod"
                    value={localFormData.applicationMethod || ''}
                    onChange={handleChange}
                >
                    {STANDARD_APPLICATION_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
                {autofilledFields.has('applicationMethod') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </div>
            <div className="mb-4">
                <label className="form-label" htmlFor="jobRating">Job Rating</label>
                <div id="jobRating" aria-label="Job Rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className="star"
                            color={star <= (localFormData.rating || 0) ? "#ffc107" : "#e4e5e9"}
                            size={24}
                            style={{ marginRight: 10, cursor: "pointer" }}
                            onClick={() => handleRatingChange(star)}
                        />
                    ))}
                </div>
            </div>
            <div className="mt-4">
                <button type="submit" className="btn btn-primary me-2">Submit</button>
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default JobApplicationForm;