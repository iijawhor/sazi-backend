import mongoose, { isValidObjectId } from "mongoose";
import { Assignment } from "../models/assignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/fileUpload.js";
// create assignment
const createAssignment = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  if (!isValidObjectId(userId)) {
    throw new ApiError(
      400,
      "Invalid or missing user ID. Please log in as a teacher to create an assignment."
    );
  }
  const { title, dueDate, grade, textAssignment, subject, totalMarks } =
    req.body;

  // Validate required fields
  if (!title || !dueDate || !grade || !subject || !totalMarks) {
    throw new ApiError(400, "All fields are required to create the assignment");
  }

  // const pdfLocalPath = req.files.pdfFile[0]?.path;

  let pdfLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.pdfFile) &&
    req.files.pdfFile.length > 0
  ) {
    pdfLocalPath = req.files.pdfFile[0].path;
  }

  if (!pdfLocalPath && !textAssignment) {
    throw new ApiError(400, "Either a PDF file or text assignment is required");
  }

  const assignmentPdf = await uploadOnCloudinary(pdfLocalPath);
  if (!assignmentPdf) {
    throw new ApiError(500, "Failed to upload the PDF file to Cloudinary");
  }

  const assignmentCreated = await Assignment.create({
    title: title,
    dueDate: dueDate,
    grade: grade,
    textAssignment: textAssignment,
    subject: subject,
    totalMarks: totalMarks,
    pdfFile: pdfLocalPath,
    createdBy: userId,
  });

  if (!assignmentCreated) {
    throw new ApiError(400, "Failed to create the Assignment");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        assignmentCreated,
        `Assignment created successfully for the grade ${grade}`
      )
    );
});
// update assignment
const updateAssignment = asyncHandler(async (req, res) => {
  const { title, dueDate, grade, textAssignment, subject, totalMarks } =
    req.body;
  const { assignmentId } = req.params;
  const updatedAssignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    {
      $set: {
        title,
        dueDate,
        grade,
        textAssignment,
        subject,
        totalMarks,
      },
    },
    { new: true }
  );

  if (!updatedAssignment) {
    throw new ApiError(401, "Something went wrong");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, updatedAssignment, "Assignment updated successfully")
    );
});
// update assignment pdf file

const updateAssignmentPdfFile = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const localFilePath = req.file?.path;
  if (!localFilePath) {
    throw new ApiError(401, "pdfFile is not found to update");
  }
  const pdfFile = await uploadOnCloudinary(localFilePath);
  if (!pdfFile) {
    throw new ApiError(201, "Pdf file doesn't exist");
  }

  const updatedPdfFile = await Assignment.findByIdAndUpdate(
    assignmentId,
    {
      $set: {
        pdfFile: pdfFile.url,
      },
    },
    { new: true }
  );

  if (!updatedPdfFile) {
    throw new ApiError(201, "Pdf file doesn't exist");
  }

  res
    .status(201)
    .json(
      20,
      new ApiResponse(201, updatedPdfFile, "Pdf file updated successfully")
    );
});

const removeAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  if (!isValidObjectId(assignmentId)) {
    throw new ApiError(400, "Invalid assignment ID");
  }

  // check assignment owner === user or not
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }
  if (
    assignment.owner.toString().toLowerCase() !==
    req.user?._id.toString().toLowerCase()
  ) {
    throw new ApiError(403, "You are not authorized to delete this assignment");
  }

  // now delete the user

  // Delete associated PDF file
  if (assignment.pdfFile) {
    try {
      await deleteFromCloudinary(assignment.pdfFile);
    } catch (error) {
      console.error(`Error deleting PDF file: ${error.message}`);
      throw new ApiError(500, "Failed to delete associated PDF file");
    }
  }
  const deleteAssignment = await Assignment.findByIdAndDelete(assignmentId);
  if (!deleteAssignment) {
    throw new ApiError(500, "Failed to delete the assignment");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Assignment deleted successfully"));
});
const submitAssignment = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const { assignmentId } = req.params;
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(404, "Not a valid user");
  }

  let pdfLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.pdfFile) &&
    req.files.pdfFile.length > 0
  ) {
    pdfLocalPath = req.files.pdfFile[0].path;
  }

  if (!pdfLocalPath && !answer) {
    throw new ApiError(400, "Either a PDF file or text assignment is required");
  }

  let assignmentPdf = "";
  if (pdfLocalPath) {
    assignmentPdf = await uploadOnCloudinary(pdfLocalPath);
    if (!assignmentPdf) {
      throw new ApiError(500, "Failed to upload the PDF file to Cloudinary");
    }
  }
  const assignmentSubmitted = await Assignment.findByIdAndUpdate(
    assignmentId,
    {
      $push: {
        assignmentAnswer: {
          submittedBy: req.user?._id,
          answer: answer,
          pdfFile: assignmentPdf || null,
        },
      },
    },
    { new: true }
  );

  if (!assignmentSubmitted) {
    throw new ApiError(401, "Assignment submission failed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignmentSubmitted,
        "assignment submitted succcessfully"
      )
    );
});
export {
  createAssignment,
  submitAssignment,
  updateAssignment,
  updateAssignmentPdfFile,
  removeAssignment,
};
