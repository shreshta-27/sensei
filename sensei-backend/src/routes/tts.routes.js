import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import axios from 'axios';

const router = Router();
router.use(verifyAccessToken);

router.post('/generate', async (req, res) => {
  try {
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = req.body;
    
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured in backend.' });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate speech', details: error.message });
  }
});

export default router;
