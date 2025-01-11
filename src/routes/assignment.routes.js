import { Router } from "express";
import {
  createAssignment,
  removeAssignment,
  submitAssignment,
  updateAssignment,
  updateAssignmentPdfFile,
} from "../controllers/assignment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router
  .route("/create-assignment")
  .post(
    verifyJWT,
    upload.fields([{ name: "pdfFile", maxCount: 1 }]),
    createAssignment
  );
router
  .route("/submit-assignment")
  .post(
    verifyJWT,
    upload.fields([{ name: "pdfFile", maxCount: 1 }]),
    submitAssignment
  );
// update the assignment
router
  .route("/update-assignment/:assignmentId")
  .patch(verifyJWT, updateAssignment);
router
  .route("/update-assignment-pdf/:assignmentId")
  .patch(verifyJWT, upload.single("pdfFile"), updateAssignmentPdfFile);

router.route("/delete-assignment").post(verifyJWT, removeAssignment);

export default router;
