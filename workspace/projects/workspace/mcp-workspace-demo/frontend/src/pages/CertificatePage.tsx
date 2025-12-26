import React, { useState } from 'react';

export const CertificatePage: React.FC = () => {
  const [commonName, setCommonName] = useState('example.com');
  const [certificate, setCertificate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch('http://localhost:4000/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commonName }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setCertificate(data.certificate);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2>Create Certificate</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Common Name:{' '}
          <input
            type="text"
            value={commonName}
            onChange={(e) => setCommonName(e.target.value)}
          />
        </label>
        <button type="submit">Generate</button>
      </form>
      {certificate && (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {certificate}
        </pre>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};
