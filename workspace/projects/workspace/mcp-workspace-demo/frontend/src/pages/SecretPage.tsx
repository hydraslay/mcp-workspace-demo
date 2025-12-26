import React, { useState } from 'react';

export const SecretPage: React.FC = () => {
  const [length, setLength] = useState(32);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSecret(null);
    try {
      const response = await fetch('http://localhost:4000/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setSecret(data.secret);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2>Create Secret</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Length:{' '}
          <input
            type="number"
            min={1}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </label>
        <button type="submit">Create</button>
      </form>
      {secret && (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{secret}</pre>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};
