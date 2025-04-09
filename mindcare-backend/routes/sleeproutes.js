import express from 'express';
import {
  createSleepEntry,
  getAllSleepEntries,
  getSleepEntryById,
  updateSleepEntry,
  deleteSleepEntry,
} from '../sleepcontroller.js'; // relative path to the root-level file

const router = express.Router();

router.post('/', createSleepEntry);
router.get('/', getAllSleepEntries);
router.get('/:id', getSleepEntryById);
router.put('/:id', updateSleepEntry);
router.delete('/:id', deleteSleepEntry);

export default router;
