import express from 'express';
import { getStudent, updateStudent} from '../services/userService.js';

const router = express.Router();

// get all of the student info
router.get("/", async (req, res) => {
  try {
      const studentId = req.user.id;
      const student = await getStudent(studentId);
      res.json(student);
  } catch (err) {
      if (err.message === 'Student not found') {
          return res.status(404).json({ error: 'Student not found' });
      }
      console.error("Error fetching student:", err);
      res.status(500).json({ error: "Failed to fetch student" });
  }
});

router.patch("/", async(req, res) => {
    try{
        const studentId = req.user.id;
        const updates = req.body;

        for (let key in updates) {
          if (updates[key] === ""){
            delete updates[key];
          }
        }
        const student = await updateStudent(studentId, updates);
        res.json(student[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update student" });
    }
});

export default router;