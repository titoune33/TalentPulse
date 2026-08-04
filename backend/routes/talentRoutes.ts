import express from 'express';
import talentService from '../services/talentService';

const router = express.Router();

// GET all talents
router.get('/', async (req, res) => {
  try {
    const talents = await talentService.getAllTalents();
    res.json(talents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch talents' });
  }
});

// GET talent by ID
router.get('/:id', async (req, res) => {
  try {
    const talent = await talentService.getTalentById(req.params.id);
    if (!talent) {
      return res.status(404).json({ error: 'Talent not found' });
    }
    res.json(talent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch talent' });
  }
});

// POST create new talent
router.post('/', async (req, res) => {
  try {
    const talent = await talentService.createTalent(req.body);
    res.status(201).json(talent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create talent' });
  }
});

// PUT update talent
router.put('/:id', async (req, res) => {
  try {
    const talent = await talentService.updateTalent(req.params.id, req.body);
    if (!talent) {
      return res.status(404).json({ error: 'Talent not found' });
    }
    res.json(talent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update talent' });
  }
});

// DELETE talent
router.delete('/:id', async (req, res) => {
  try {
    const talent = await talentService.deleteTalent(req.params.id);
    if (!talent) {
      return res.status(404).json({ error: 'Talent not found' });
    }
    res.json({ message: 'Talent deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete talent' });
  }
});

// GET search talents
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const talents = await talentService.searchTalents(query);
    res.json(talents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search talents' });
  }
});

export default router;
