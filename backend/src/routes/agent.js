import express from 'express';
import axios from 'axios';

const router = express.Router();

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * GET /voices
 * List available voices from ElevenLabs
 */
router.get('/voices', async (req, res) => {
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    res.json({
      success: true,
      voices: response.data.voices.map(v => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category,
        description: v.description,
        preview_url: v.preview_url
      }))
    });
  } catch (error) {
    console.error('Voices fetch error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch voices',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /conversation-config
 * Get configuration for ElevenLabs Conversational Agent
 */
router.post('/conversation-config', async (req, res) => {
  try {
    const { prospectName, companyName, summary } = req.body;

    // Build a dynamic system prompt based on the research
    const systemPrompt = buildAgentPrompt(prospectName, companyName, summary);

    res.json({
      success: true,
      config: {
        agent: {
          name: prospectName || 'Prospect',
          prompt: {
            prompt: systemPrompt
          },
          first_message: `Hi, I'm ${prospectName || 'the prospect'} from ${companyName || 'the company'}. Thanks for making time. Walk me through what you do and why I should care?`,
          voice: {
            // Use a confident, professional male voice (similar to Harvey Specter energy)
            voice_id: "pNInz6obpgDQGcFmaJgB" // Adam - confident, professional male
          },
          temperature: 0.7,
          max_output_tokens: 200
        }
      }
    });
  } catch (error) {
    console.error('Config error:', error.message);
    res.status(500).json({
      error: 'Failed to generate agent config',
      details: error.message
    });
  }
});

/**
 * POST /synthesize
 * Simple TTS endpoint for static messages
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice_id } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voice_id || 'pNInz6obpgDQGcFmaJgB'}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Synthesize error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to synthesize speech',
      details: error.response?.data || error.message
    });
  }
});

// Build dynamic agent prompt based on research
function buildAgentPrompt(prospectName, companyName, summary) {
  const painPoints = summary?.painPoints?.join('; ') || 'unknown challenges';
  const objections = summary?.objections?.join('; ') || 'budget and timing concerns';

  return `You are ${prospectName || 'a busy executive'} from ${companyName || 'a prospect company'}.
You are skeptical of sales pitches but willing to listen if the rep demonstrates they've done their homework.

YOUR CONTEXT:
- Company: ${companyName}
- Key challenges: ${painPoints}
- Common objections you raise: ${objections}

YOUR BEHAVIOR:
1. Start skeptical but warm up if the rep shows genuine insight
2. Ask tough, specific questions about ROI, implementation, and differentiation
3. If the rep gives generic answers, push back harder
4. If they reference your specific situation, show interest
5. Keep responses concise (1-3 sentences)
6. Sound like a busy executive - direct, no-nonsense, but fair

KEY PHRASES TO USE:
- "Walk me through..."
- "But here's my concern..."
- "How is this different from..."
- "What would that actually look like for us?"
- "I don't play odds, I play man" (use this as your closing philosophy when appropriate)

Remember: You control the conversation. If the rep bores you, disengage. If they impress you, lean in.`;
}

export default router;
