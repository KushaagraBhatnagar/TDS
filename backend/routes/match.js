import express from 'express';
import Client from '../models/Client.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateMatches } from '../services/matchingAlgo.js';
import { 
  extractWeightsFromBio, 
  analyzeCompatibility, 
  generateEmailIntro 
} from '../services/aiService.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

router.use(authMiddleware);

// Get matches for a client
router.get('/:id/matches', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Find all active clients of the opposite gender
    const oppositeGender = client.gender === 'male' ? 'female' : 'male';
    const candidates = await Client.find({ 
      gender: oppositeGender,
      journeyStage: { $ne: 'Inactive' }
    });

    // Run compatibility analysis for all candidates using fast local path
    const matchResults = [];
    for (const candidate of candidates) {
      const comp = await analyzeCompatibility(client, candidate, true);
      // Filter: only show matches with score > 50
      if (comp.score > 50) {
        matchResults.push({
          profile: candidate,
          score: comp.score,
          compatibility: comp
        });
      }
    }

    // Sort candidates by score descending
    matchResults.sort((a, b) => b.score - a.score);
    
    res.json(matchResults);
  } catch (error) {
    console.error('Failed to compute matches:', error);
    res.status(500).json({ error: 'Failed to compute matches due to an internal server error' });
  }
});

// Initialize weights from bio
router.post('/:id/ai-weights', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (!client.bio || client.bio.trim() === '') {
      return res.status(400).json({ error: 'Client bio is empty! Add a bio to initialize weights via AI.' });
    }

    // Extract weights via LLM/Rule engine
    const weights = await extractWeightsFromBio(client.bio, client);

    client.customWeights = weights;
    await client.save();

    res.json({
      message: 'Sliders weights successfully initialized by AI!',
      weights
    });
  } catch (error) {
    console.error('Failed to initialize AI weights:', error);
    res.status(500).json({ error: 'Failed to initialize AI weights due to an internal server error' });
  }
});

// Generate deep compatibility details
router.post('/reasoning', async (req, res) => {
  try {
    const { clientId, candidateId } = req.body;
    if (!clientId || !candidateId) {
      return res.status(400).json({ error: 'Both clientId and candidateId are required' });
    }

    const client = await Client.findById(clientId);
    const candidate = await Client.findById(candidateId);

    if (!client || !candidate) {
      return res.status(404).json({ error: 'Client or Candidate profile not found' });
    }

    const reasoning = await analyzeCompatibility(client, candidate);
    res.json(reasoning);
  } catch (error) {
    console.error('Failed to run AI compatibility analysis:', error);
    res.status(500).json({ error: 'Failed to run AI compatibility analysis due to an internal server error' });
  }
});

// Generate email introduction pitch
router.post('/email-intro', async (req, res) => {
  try {
    const { clientId, candidateId, compatibilitySummary } = req.body;
    if (!clientId || !candidateId) {
      return res.status(400).json({ error: 'Both clientId and candidateId are required' });
    }

    const client = await Client.findById(clientId);
    const candidate = await Client.findById(candidateId);

    if (!client || !candidate) {
      return res.status(404).json({ error: 'Client or Candidate profile not found' });
    }

    const rawName = req.user?.username || 'Your TDC Matchmaker';
    const matchmakerName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const emailPitch = await generateEmailIntro(client, candidate, compatibilitySummary || '', matchmakerName);
    res.json(emailPitch);
  } catch (error) {
    console.error('Failed to write email intro pitch:', error);
    res.status(500).json({ error: 'Failed to write email intro pitch due to an internal server error' });
  }
});

// Send match (marks candidate as recommended)
router.post('/send', async (req, res) => {
  try {
    const { clientId, candidateId, subject, body } = req.body;
    if (!clientId || !candidateId) {
      return res.status(400).json({ error: 'Both clientId and candidateId are required' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Dispatch email first if subject and body are provided
    let emailResult = null;
    if (subject && body) {
      try {
        emailResult = await sendEmail({
          to: client.email,
          subject,
          text: body
        });
      } catch (err) {
        console.error('Failed to dispatch match email:', err);
        return res.status(500).json({ error: 'Failed to send matchmaking email pitch. Operation aborted.' });
      }
    }

    // Add candidate to matchesSent if not already present
    if (!client.matchesSent.includes(candidateId)) {
      client.matchesSent.push(candidateId);
      
      // Transition stage to Matched if client was searching
      if (client.journeyStage === 'Searching' || client.journeyStage === 'Lead' || client.journeyStage === 'Onboarding') {
        client.journeyStage = 'Matched';
      }
      
      await client.save();
    }

    res.json({
      message: 'Match recommendation marked as SENT successfully!',
      matchesSent: client.matchesSent,
      journeyStage: client.journeyStage,
      emailResult
    });
  } catch (error) {
    console.error('Failed to complete send match action:', error);
    res.status(500).json({ error: 'Failed to complete send match action due to an internal server error' });
  }
});

export default router;
