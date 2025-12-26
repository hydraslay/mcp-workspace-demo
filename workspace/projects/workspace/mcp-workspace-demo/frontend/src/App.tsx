import React, { useState } from 'react';
import { SecretPage } from './pages/SecretPage';
import { CertificatePage } from './pages/CertificatePage';
import { SignRequestPage } from './pages/SignRequestPage';

export type Page = 'secret' | 'certificate' | 'sign-request';

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('secret');

  return (
    <div className="app-container">
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setPage('secret')}>Create Secret</button>
        <button onClick={() => setPage('certificate')}>Create Certificate</button>
        <button onClick={() => setPage('sign-request')}>Create Sign Request</button>
      </nav>
      <main style={{ padding: '1rem' }}>
        {page === 'secret' && <SecretPage />}
        {page === 'certificate' && <CertificatePage />}
        {page === 'sign-request' && <SignRequestPage />}
      </main>
    </div>
  );
};
