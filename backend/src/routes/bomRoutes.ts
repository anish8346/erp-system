import { Router } from 'express';
import { createBoM, getBoMs } from '../controllers/bomController.js';

const router = Router();

router.post('/', createBoM);
router.get('/', getBoMs);

export default router;
