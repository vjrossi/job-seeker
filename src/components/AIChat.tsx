import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import Instructions from './Instructions';
import './AIChat.css';

const AIChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quota, setQuota] = useState({ requestsThisMinute: 0, requestsRemaining: 60 });

  useEffect(() => {
    const instructionsComponent = Instructions({});
    if (React.isValidElement(instructionsComponent)) {
      const instructionsText = JSON.stringify(instructionsComponent.props);
      geminiService.updateSystemContext(instructionsText);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await geminiService.generateResponse(prompt);
      setResponse(result);
      setQuota(geminiService.getRemainingQuota());
    } catch (error) {
      console.error('Failed to generate response:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="ai-chat">
      <Card.Header>
        AI Assistant (Powered by Gemini)
        <div className="float-end small text-muted">
          Requests remaining: {quota.requestsRemaining}/60 this minute
        </div>
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
              'Generate Response'
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