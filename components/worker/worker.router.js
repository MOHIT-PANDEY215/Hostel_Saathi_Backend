import { Router } from "express";
import workerController from "./worker.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const workerRouter = Router();

/**
 * @swagger
 * /api/v1/worker/all:
 *   get:
 *     summary: Get all workers with pagination, search, and filters
 *     tags: [Workers]
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of workers per page (default is 5)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search workers by full name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter workers by role
 *     responses:
 *       200:
 *         description: List of workers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 ref:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
workerRouter.get("/all", workerController.getAllWorkers);

/**
 * @swagger
 * /api/v1/worker:
 *   get:
 *     summary: Get a worker by ID
 *     tags: [Workers]
 *     parameters:
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the worker to fetch
 *     responses:
 *       200:
 *         description: Worker fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 worker:
 *                   type: object
 *       400:
 *         description: Bad request (workerId missing)
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Internal server error
 */
workerRouter.get("/", workerController.getWorkerById);
export default workerRouter;
