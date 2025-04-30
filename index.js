const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON))
});

app.post('/lineLogin', async (req, res) => {
  const accessToken = req.body.accessToken;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    // Verify access token with LINE
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const lineProfile = profileResponse.data;
    const uid = `line:${lineProfile.userId}`;

    // Create Firebase custom token
    const firebaseToken = await admin.auth().createCustomToken(uid);

    res.json({ firebaseToken });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'LINE token verification failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

