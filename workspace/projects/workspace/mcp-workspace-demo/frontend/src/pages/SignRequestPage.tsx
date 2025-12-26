import React, { useState } from 'react';

export const SignRequestPage: React.FC = () => {
  const [data, setData] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignature(null);
    try {
      const response = await fetch('http://localhost:4000/sign-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      setSignature(result.signature);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2>Create Sign Request</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Data to Sign:{' '}
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            rows={4}
            cols={40}
          />
        </label>
        <br />
        <button type="submit">Sign</button>
      </form>
      {signature && (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {signature}
        </pre>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};
