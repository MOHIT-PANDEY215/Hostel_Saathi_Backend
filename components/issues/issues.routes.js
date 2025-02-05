import express from 'express';
import { assignWorker, createIssue, deleteIssue, getAllIssues, getIssuesById, updateIssue } from './issues.controller';

const router = express.Router();

router.get('/', getAllIssues);
router.get('/:id', getIssuesById);
router.post('/', createIssue);
router.put('/:id/assign', assignWorker);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);