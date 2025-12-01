import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
    try {
    const { data, error } = await supabase
      .from('saved_organizations')
      .select(`
        id,
        org_id,
        org:org_id (
          id,
          name,
          org_description,
          website,
          email
          )
        `)
        .eq('user_id', user_id);
    if (error) throw error;

    const formatted = data.map((s) => s.org);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching saved organizations:', err);
    res.status(500).json({ error: 'Failed to fetch saved organizations' });
    }
});


router.post('/', async (req, res) => {
    try {
        const { user_id, org_id } = req.body;
        if (!user_id || !org_id) {
            return res.status(400).json({ error: 'Missing user_id or org_id' });
        }
        const { data, error } = await supabase
            .from('saved_organizations')
            .upsert([{ user_id, org_id }])
            .select();
        
        if (error) throw error;
        res.json({ message: 'Saved successfully', data });
    } catch (err) {
        console.error('Error saving organization:', err);
        res.status(500).json({ error: 'Failed to save organization' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const { user_id, org_id } = req.body;
        if (!user_id || !org_id) {
            return res.status(400).json({ error: 'Missing user_id or org_id' });
        }

        const { data, error } = await supabase
            .from('saved_organizations')
            .delete()
            .eq('user_id', user_id)
            .eq('org_id', org_id);
        if (error) throw error;
        res.json({ message: 'Organization unsaved successfully', data });
    } catch (err) {
        console.error('Error unsaving organization:', err);
        res.status(500).json({ error: 'Failed to unsave organization' });
    }
});

export default router;