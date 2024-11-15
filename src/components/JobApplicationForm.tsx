import React, { useState, useEffect, useRef, useMemo } from 'react';
import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { FaStar } from 'react-icons/fa';
import { geminiService } from '../services/geminiService';
import { Button, Spinner, Alert, Form } from 'react-bootstrap';
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
                "jobType": "one of: Remote, Hybrid, In Person, or Unspecified",
                "applicationMethod": "one of: Direct, Email, Seek, LinkedIn, Indeed, or Other",
                "source": "determine if this is from Seek, LinkedIn, Indeed, or other job board",
                "location": "extract city name only (e.g., Melbourne, Sydney, Brisbane)",
                "payRange": "extract salary range if mentioned (e.g., $80,000 - $90,000 per year, or Undisclosed if not mentioned)"
            }
            
            Important: 
            - For jobType, look for mentions of remote work, hybrid arrangements, or in-person/office requirements
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
                if (parsed.companyName?.trim()) filled.add('companyName');
                if (parsed.jobTitle?.trim()) filled.add('jobTitle');
                if (parsed.applicationMethod && parsed.applicationMethod !== 'Other') filled.add('applicationMethod');
                if (parsed.location?.trim()) filled.add('location');
                if (parsed.payRange && parsed.payRange !== 'Undisclosed') filled.add('payRange');
                if (parsed.jobType && parsed.jobType !== 'Unspecified') filled.add('jobType');

                setAutofilledFields(filled);

                setLocalFormData(prev => ({
                    ...prev,
                    companyName: parsed.companyName?.trim() || prev.companyName,
                    jobTitle: parsed.jobTitle?.trim() || prev.jobTitle,
                    jobType: parsed.jobType && parsed.jobType !== 'Unspecified' ? parsed.jobType : prev.jobType,
                    applicationMethod: applicationMethod || prev.applicationMethod,
                    location: parsed.location?.trim() || prev.location,
                    payRange: parsed.payRange === 'Undisclosed' ? '' : (parsed.payRange?.trim() || prev.payRange),
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
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Initial Status</Form.Label>
                <Form.Select
                    id="initialStatus"
                    name="initialStatus"
                    value={localFormData.statusHistory?.[0]?.status || ApplicationStatus.Bookmarked}
                    onChange={handleChange}
                    className={autofilledFields.has('initialStatus') ? 'field-autofilled' : ''}
                >
                    <option value={ApplicationStatus.Bookmarked}>Bookmarked</option>
                    <option value={ApplicationStatus.Applied}>Applied</option>
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={localFormData.companyName || ''}
                    onChange={handleChange}
                    required
                    className={autofilledFields.has('companyName') ? 'field-autofilled' : ''}
                />
                {autofilledFields.has('companyName') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Job Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={localFormData.jobTitle || ''}
                    onChange={handleChange}
                    required
                    className={autofilledFields.has('jobTitle') ? 'field-autofilled' : ''}
                />
                {autofilledFields.has('jobTitle') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Work Arrangement</Form.Label>
                <Form.Select
                    id="jobType"
                    name="jobType"
                    value={localFormData.jobType || JobType.Unspecified}
                    onChange={handleChange}
                    className={autofilledFields.has('jobType') ? 'field-autofilled' : ''}
                >
                    {JOB_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Form.Select>
                {autofilledFields.has('jobType') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Job Location</Form.Label>
                <Form.Control
                    type="text"
                    id="location"
                    name="location"
                    value={localFormData.location || ''}
                    onChange={handleChange}
                    placeholder="e.g., Melbourne, Sydney"
                    className={autofilledFields.has('location') ? 'field-autofilled' : ''}
                />
                {autofilledFields.has('location') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Pay Range</Form.Label>
                <Form.Control
                    type="text"
                    id="payRange"
                    name="payRange"
                    value={localFormData.payRange || ''}
                    onChange={handleChange}
                    placeholder="e.g., $80,000 - $90,000 per year"
                    className={autofilledFields.has('payRange') ? 'field-autofilled' : ''}
                />
                {autofilledFields.has('payRange') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="jobDescription">
                    Job Details
                    <span className="job-description-hint ms-2">
                        💡 Pro tip: Paste the job posting here and click "Extract Job Details"
                    </span>
                </Form.Label>
                <Form.Control
                    as="textarea"
                    id="jobDescription"
                    name="jobDescription"
                    value={localFormData.jobDescription || ''}
                    onChange={(e) => {
                        handleChange(e);
                        if (Math.abs(e.target.value.length - (localFormData.jobDescription?.length || 0)) > 50) {
                            setTimeout(handleParseJobDescription, 100);
                        }
                    }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData('text/plain');
                        setLocalFormData(prev => ({
                            ...prev,
                            jobDescription: text
                        }));
                        setTimeout(handleParseJobDescription, 100);
                    }}
                    rows={5}
                    maxLength={10000}
                    placeholder="Paste job description here... (max 10,000 characters)"
                    className="highlight-field"
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
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Application Method</Form.Label>
                <Form.Select
                    id="applicationMethod"
                    name="applicationMethod"
                    value={localFormData.applicationMethod || ''}
                    onChange={handleChange}
                    className={autofilledFields.has('applicationMethod') ? 'field-autofilled' : ''}
                >
                    {STANDARD_APPLICATION_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </Form.Select>
                {autofilledFields.has('applicationMethod') && (
                    <div className="field-feedback">✓ Auto-filled; please check</div>
                )}
            </Form.Group>
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
        </Form>
    );
};

export default JobApplicationForm;