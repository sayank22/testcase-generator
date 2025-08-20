```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeGeneration from 'client/src/components/TestCaseGenerator/CodeGeneration';

jest.mock('lucide-react', () => ({
  GitPullRequest: () => <svg>GitPullRequest</svg>,
  Loader2: () => <svg>Loader2</svg>,
}));


describe('CodeGeneration Component', () => {
  test('renders correctly with generated code', () => {
    render(<CodeGeneration generatedCode="console.log('test');" selectedSummary="Summary" loading={false} />);
    expect(screen.getByText('Generated Test Code')).toBeInTheDocument();
    expect(screen.getByText('console.log(\'test\');')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Create Pull Request/i })).toBeInTheDocument();
    expect(screen.queryByRole('svg', { name: /Loader2/i })).not.toBeInTheDocument();

  });

  test('renders correctly without generated code', () => {
    render(<CodeGeneration generatedCode="" selectedSummary="" loading={false} />);
    expect(screen.getByText('Generated Test Code')).toBeInTheDocument();
    expect(screen.queryByText('console.log(\'test\');')).not.toBeInTheDocument();
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Create Pull Request/i })).toBeInTheDocument();
    expect(screen.queryByRole('svg', { name: /Loader2/i })).not.toBeInTheDocument();

  });

  test('renders loading state correctly', () => {
    render(<CodeGeneration generatedCode="" selectedSummary="" loading={true} />);
    expect(screen.getByText('Generated Test Code')).toBeInTheDocument();
    expect(screen.queryByRole('svg', { name: /Loader2/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Create Pull Request/i })).not.toBeInTheDocument();

  });

  test('handles onCreatePullRequest prop', () => {
    const handleCreatePullRequest = jest.fn();
    render(<CodeGeneration generatedCode="test" selectedSummary="test" loading={false} onCreatePullRequest={handleCreatePullRequest} />);
    fireEvent.click(screen.getByRole('button', { name: /Create Pull Request/i }));
    expect(handleCreatePullRequest).toHaveBeenCalledTimes(1);
  });


  test('renders correctly with long generated code and truncated summary', () => {
    const longCode = 'console.log("This is a very long piece of generated code that exceeds the typical display length.");'.repeat(10);
    const truncatedSummary = "Summary (truncated)";

    render(<CodeGeneration generatedCode={longCode} selectedSummary={truncatedSummary} loading={false} />);
    // Expecting the code to be truncated or handled appropriately by the component's styling.  This test focuses on rendering without errors.
    expect(screen.getByText('Generated Test Code')).toBeInTheDocument();
    expect(screen.getByText(truncatedSummary)).toBeInTheDocument();
    expect(screen.queryByRole('svg', { name: /Loader2/i })).not.toBeInTheDocument();
  });
});
```