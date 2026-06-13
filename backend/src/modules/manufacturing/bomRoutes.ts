import { Router } from 'express';
import { createBoM, getBoMs } from './bomController.js';

const router = Router();

router.post('/', createBoM);
router.get('/', getBoMs);

export default router;
