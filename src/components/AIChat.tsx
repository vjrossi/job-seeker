import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import Instructions from './Instructions';
import './AIChat.css';
import { JobApplication } from '../types/JobApplication';

interface AIChatProps {
  applications?: JobApplication[];
}

const AIChat: React.FC<AIChatProps> = ({ applications = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quota, setQuota] = useState({ requestsThisMinute: 0, requestsRemaining: 60 });

  useEffect(() => {
    const instructionsComponent = Instructions({});
    if (React.isValidElement(instructionsComponent)) {
      const instructionsText = JSON.stringify(instructionsComponent.props);
      geminiService.updateSystemContext(instructionsText);
      geminiService.updateApplicationsContext(applications);
    }
  }, [applications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null); // Clear any previous errors
    
    try {
      const result = await geminiService.generateResponse(prompt);
      setResponse(result);
      setQuota(geminiService.getRemainingQuota());
    } catch (error) {
      console.error('Failed to generate response:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate response');
      setResponse(''); // Clear any previous response
    } finally {
      setIsGenerating(false);
    }
  };

  const showQuotaWarning = quota.requestsRemaining < 10;

  return (
    <Card className="ai-chat">
      <Card.Header>
        AI Assistant
        {showQuotaWarning && (
          <div className="float-end small text-warning">
            Warning: {quota.requestsRemaining} requests remaining
          </div>
        )}
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              disabled={isGenerating || quota.requestsRemaining === 0}
            />
          </Form.Group>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Button 
            type="submit" 
            disabled={!prompt.trim() || isGenerating || quota.requestsRemaining === 0}
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Generating...
              </>
            ) : (
              'Ask Zynergy'
            )}
          </Button>
          {response && (
            <div className="mt-3">
              <h6>Response:</h6>
              <div className="response-text">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AIChat; 