import express from "express";
import { generatePresignedUrl } from "../../controllers/aws/s3Controller.js";

const router = express.Router();

router.get("/generate-presigned-url", generatePresignedUrl);

export default router;
