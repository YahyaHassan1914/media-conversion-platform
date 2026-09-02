import { Router } from "express";

import jobRoutes from "../modules/jobs/job.routes.js";

const router = Router();

router.use("/jobs", jobRoutes);

export default router;