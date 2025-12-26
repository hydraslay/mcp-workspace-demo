import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.post('/secret', (req, res) => {
  const { length = 32 } = req.body;
  // Generate dummy secret
  const secret = Buffer.from('a'.repeat(length)).toString('hex').slice(0, length);
  res.json({ secret });
});

app.post('/certificate', (req, res) => {
  const { commonName = 'example.com' } = req.body;
  // Dummy certificate
  const certificate = `-----BEGIN CERTIFICATE-----\nFAKE-CERT-${commonName}\n-----END CERTIFICATE-----`;
  res.json({ certificate });
});

app.post('/sign-request', (req, res) => {
  const { data = '' } = req.body;
  // Dummy signature
  const signature = `signature_of_${data}`;
  res.json({ signature });
});

app.listen(port, () => {
  console.log(`OpenSSL Toolbox server listening at http://localhost:${port}`);
});
