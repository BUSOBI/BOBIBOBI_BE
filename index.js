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

app.use(cors()); // CORS 설정
app.use(express.json());

// OAuth Authorize Endpoint
app.get('/oauth/authorize', (req, res) => {
  const { client_id, redirect_uri, response_type } = req.query;

  // 클라이언트 애플리케이션에서 요구하는 인증 및 권한 부여 로직을 구현해야 합니다.
  // 여기서는 단순히 인증 코드를 발급하도록 예시를 작성합니다.
  if (client_id && redirect_uri && response_type === 'code') {
    // 인증 코드 발급 및 리디렉션
    const authorizationCode = 'randomAuthorizationCode'; // 실제로는 보안적인 방법으로 코드를 생성해야 합니다.
    const callbackUrl = `${redirect_uri}?code=${authorizationCode}`;
    res.redirect(callbackUrl);
  } else {
    // 필요한 매개변수가 부족하면 오류 처리
    res.status(400).json({ error: 'Invalid parameters for authorization.' });
  }
});

// OAuth Callback Endpoint
app.get('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await bsmOauth.token.get(code.toString());

    if (!tokenResponse.access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token.' });
    }

    // Use access token to get user information
    const user = await bsmOauth.user.get(tokenResponse.access_token);

    if (!user.role) {
      return res.status(400).json({ error: 'User role is missing.' });
    }

    // Check user role and return appropriate response
    if (isStudent(user)) {
      return res.status(200).json(user);
    }

    if (isTeacher(user)) {
      return res.status(200).json(user);
    }

    return res.status(400).json({ error: 'Unknown user role.' });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
