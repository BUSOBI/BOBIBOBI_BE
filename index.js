import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { BsmOauth, isStudent, isTeacher } from 'bsm-oauth-node';

const app = express();
const port = process.env.PORT || 8088;
const bsmOauth = new BsmOauth({
  clientId: process.env.BSM_AUTH_CLIENT_ID,
  clientSecret: process.env.BSM_AUTH_CLIENT_SECRET,
});

app.use(cors());
app.use(express.json());

app.get('/oauth/authorize', (req, res) => {
  const { client_id, redirect_uri, response_type } = req.query;

  if (client_id && redirect_uri && response_type === 'code') {
    const authorizationCode = 'randomAuthorizationCode'; // 실제로는 보안적인 방법으로 코드를 생성해야 합니다.
    const callbackUrl = `${redirect_uri}?code=${authorizationCode}`;
    res.redirect(callbackUrl);
  } else {
    res.status(400).json({ error: 'Invalid parameters for authorization.' });
  }
});

app.post('/oauth/token', async (req, res) => {
  try {
    const { code, client_id, redirect_uri, grant_type } = req.body;

    if (!code || !client_id || !redirect_uri || grant_type !== 'authorization_code') {
      return res.status(400).json({ error: 'Invalid request parameters.' });
    }

    const tokenResponse = await bsmOauth.token.get(code);

    if (!tokenResponse.access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token.' });
    }

    res.json({ access_token: tokenResponse.access_token });
  } catch (error) {
    console.error('Error exchanging authorization code for access token:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
