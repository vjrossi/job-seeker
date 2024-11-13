import React, { useState, useCallback } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { webLLMService } from '../services/webLLMService';
import './AIChat.css';

const AIChat: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const success = await webLLMService.initialize((report) => {
        setInitStatus(report.text);
      });
      setIsInitialized(success);
    } catch (error) {
      console.error('Failed to initialize WebLLM:', error);
      setInitStatus('Failed to initialize WebLLM');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await webLLMService.generateResponse(prompt);
      setResponse(result.choices[0].message.content);
    } catch (error) {
      console.error('Failed to generate response:', error);
      setResponse('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="ai-chat">
      <Card.Header>AI Assistant</Card.Header>
      <Card.Body>
        {!isInitialized ? (
          <div className="text-center">
            <Button 
              onClick={handleInitialize} 
              disabled={isInitializing}
            >
              {isInitializing ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Initializing...
                </>
              ) : (
                'Initialize AI'
              )}
            </Button>
            {initStatus && (
              <div className="mt-2 text-muted small">{initStatus}</div>
            )}
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                disabled={isGenerating}
              />
            </Form.Group>
            <Button 
              type="submit" 
              disabled={!prompt.trim() || isGenerating}
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
                <div className="response-text">{response}</div>
              </div>
            )}
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default AIChat; 