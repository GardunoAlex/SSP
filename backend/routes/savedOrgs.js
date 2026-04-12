import express from 'express';
import supabase from '../supabaseClient.js';
import { getSavedOrgs, saveOrg, deleteSavedOrg } from '../services/userService.js';

const router = express.Router();

// fetches a students saved orgs
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const orgs = await getSavedOrgs(userId);
        res.json(orgs);
    } catch (err) {
        console.error('Error fetching saved organizations:', err);
        res.status(500).json({ error: 'Failed to fetch saved organizations' });
    }
});

// saves an org for the student
router.post('/', async (req, res) => {
    try {
        const { org_id } = req.body;
        const userId = req.user.id;
        if (!org_id) {
            return res.status(400).json({ error: 'Missing org_id' });
        }
        const org = await saveOrg(userId, org_id);
        res.json({ message: 'Saved successfully', org });
    } catch (err) {
        console.error('Error saving organization:', err);
        res.status(500).json({ error: 'Failed to save organization' });
    }
});

//remove a saved org
router.delete('/', async (req, res) => {
    try {
        const { org_id } = req.body;
        const userId = req.user.id;
        if (!org_id) {
            return res.status(400).json({ error: 'Missing org_id' });
        }

        await deleteSavedOrg(userId, org_id);
        res.json({ message: 'Organization unsaved successfully'});
    } catch (err) {
        console.error('Error unsaving organization:', err);
        res.status(500).json({ error: 'Failed to unsave organization' });
    }
});

export default router;