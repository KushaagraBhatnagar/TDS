import express from 'express';
import Client from '../models/Client.js';
import { authMiddleware } from '../middleware/auth.js';
import { analyzeNoteSentiment } from '../services/aiService.js';
import { validateStageUpdate, validateNoteLog, validateWeightsUpdate } from '../middleware/validation.js';

const router = express.Router();

// Apply auth middleware to all client routes
router.use(authMiddleware);

// Get stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const clients = await Client.find({});

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.journeyStage !== 'Inactive').length;
    const matchedClients = clients.filter(c => c.journeyStage === 'Matched').length;
    
    // Success rate of matches
    const successRate = totalClients > 0 ? Math.round((matchedClients / totalClients) * 100) : 0;

    // Matches recommended/sent counts
    const totalMatchesSent = clients.reduce((acc, c) => acc + (c.matchesSent?.length || 0), 0);

    // Gender breakdown
    const maleCount = clients.filter(c => c.gender === 'male').length;
    const femaleCount = clients.filter(c => c.gender === 'female').length;

    // Region distribution
    const citiesCount = {};
    clients.forEach(c => {
      citiesCount[c.city] = (citiesCount[c.city] || 0) + 1;
    });
    
    const regions = Object.entries(citiesCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5 regions

    res.json({
      totalClients,
      activeClients,
      matchedClients,
      successRate,
      totalMatchesSent,
      genderRatio: {
        male: maleCount,
        female: femaleCount
      },
      regions
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats due to an internal server error' });
  }
});

// List all clients with search/filters
router.get('/', async (req, res) => {
  try {
    const { search, gender, stage } = req.query;

    const query = {};

    // Filter by assigned matchmaker (optional, let's allow seeing all for the dashboard, but filter by query params)
    if (gender) {
      query.gender = gender.toLowerCase();
    }
    if (stage) {
      query.journeyStage = stage;
    }

    if (search) {
      const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { city: searchRegex },
        { religion: searchRegex },
        { caste: searchRegex }
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients list due to an internal server error' });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Failed to fetch client details:', error);
    res.status(500).json({ error: 'Failed to fetch client details due to an internal server error' });
  }
});

// Update journey stage
router.put('/:id/stage', validateStageUpdate, async (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.journeyStage = stage;
    await client.save();
    res.json({ message: 'Journey stage updated successfully', stage: client.journeyStage });
  } catch (error) {
    console.error('Failed to update stage:', error);
    res.status(500).json({ error: 'Failed to update stage due to an internal server error' });
  }
});

// Update custom weights
router.put('/:id/weights', validateWeightsUpdate, async (req, res) => {
  try {
    const { weights } = req.body;
    if (!weights) {
      return res.status(400).json({ error: 'Weights are required' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.customWeights = {
      age: Number(weights.age) || 5,
      location: Number(weights.location) || 5,
      income: Number(weights.income) || 5,
      diet: Number(weights.diet) || 5,
      values: Number(weights.values) || 5,
      education: Number(weights.education) || 5,
      religion: Number(weights.religion) || 5
    };

    await client.save();
    res.json({ message: 'Weights updated successfully', weights: client.customWeights });
  } catch (error) {
    console.error('Failed to update weights:', error);
    res.status(500).json({ error: 'Failed to update custom weights due to an internal server error' });
  }
});

// Log call/meeting note and analyze concerns
router.post('/:id/notes', validateNoteLog, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Note text is required' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Call AI Service to extract timeline concerns
    const { concerns } = await analyzeNoteSentiment(text);

    const newNote = {
      text,
      concerns,
      createdAt: new Date()
    };

    client.notes.push(newNote);
    await client.save();

    res.status(201).json({
      message: 'Note logged successfully and concerns analyzed!',
      note: client.notes[client.notes.length - 1]
    });
  } catch (error) {
    console.error('Failed to log meeting note:', error);
    res.status(500).json({ error: 'Failed to log meeting note due to an internal server error' });
  }
});

export default router;
