import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Flex, Text, Box, Card, Heading, Code } from '@radix-ui/themes';
import { Icon } from '../components/icons/icons';
import '../styles/main.scss';

/**
 * VectorSigmaErrorBoundaryProps Interface
 * @description Configuration properties for the VectorSigma Error Boundary.
 */
export interface VectorSigmaErrorBoundaryProps {
  /** The VectorSigma form component to wrap */
  children: ReactNode;
  
  /** 
   * Optional custom fallback UI. 
   * Can be a ReactNode or a render prop function exposing the error and reset method.
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  
  /** 
   * Optional callback fired when an error is caught. 
   * Useful for logging to external services (e.g., Sentry, Datadog).
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** 
   * Optional callback fired when the user clicks the recovery/reset button.
   */
  onReset?: () => void;

  /**
   * The primary brand color passed down from the VectorSigma instance.
   */
  brandColor?: string;
}

interface VectorSigmaErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class VectorSigmaErrorBoundary extends Component<VectorSigmaErrorBoundaryProps, VectorSigmaErrorBoundaryState> {
  constructor(props: VectorSigmaErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): VectorSigmaErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error("VectorSigma Engine crashed during rendering:", error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.resetError);
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const accentColor = this.props.brandColor || 'var(--accent-9)';

      return (
        <Card 
          size="3" 
          variant="surface" 
          style={{ 
            backgroundColor: 'var(--gray-2)', 
            borderColor: 'var(--gray-5)',
            width: '100%', 
            fontFamily: "'Libre Franklin', sans-serif" 
          }}
        >
          <Flex direction="column" gap="3">
            <Flex align="center" gap="2">
              <div style={{ color: accentColor, display: 'flex' }}>
                <Icon name="layers" width="20" height="20" />
              </div>
              <Heading size="3" style={{ color: 'var(--gray-12)' }}>
                VectorSigma Render Exception
              </Heading>
            </Flex>
            
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              The form engine encountered a critical rendering error. This is typically caused by a malformed schema matrix or an invalid prop passed to a nested component.
            </Text>
            
            {this.state.error && (
              <Box 
                style={{ 
                  backgroundColor: 'var(--gray-3)', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--gray-6)',
                  overflowX: 'auto'
                }}
              >
                <Code size="1" style={{ color: 'var(--gray-12)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: 'transparent' }}>
                  {this.state.error.toString()}
                </Code>
              </Box>
            )}
            
            <Flex mt="2" justify="start">
              <button 
                onClick={this.resetError}
                style={{
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '32px',
                  padding: '0 16px',
                  border: `1px solid ${accentColor}`,
                  backgroundColor: accentColor,
                  color: '#ffffff',
                  fontSize: '0.8125rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Attempt Recovery
              </button>
            </Flex>
          </Flex>
        </Card>
      );
    }

    return this.props.children;
  }
}