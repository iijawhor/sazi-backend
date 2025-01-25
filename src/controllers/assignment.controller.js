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
  console.log("REQ...", req.files);

  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(
      400,
      "Invalid or missing user ID. Please log in as a teacher to create an assignment."
    );
  }
  const { title, dueDate, grade, description, subject, totalMarks } = req.body; // get data from body
  // Validate required fields
  if (!title || !dueDate || !grade || !subject || !totalMarks) {
    throw new ApiError(400, "All fields are required to create the assignment");
  }
  // get the file path to upload
  // const pdfLocalPath = req.files.pdfFile[0]?.path;
  let pdfLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.pdfFile) &&
    req.files.pdfFile.length > 0
  ) {
    pdfLocalPath = req.files.pdfFile[0].path;
  }

  if (!description && !pdfLocalPath) {
    throw new ApiError(400, "Description or pdfFile  is required.");
  }
  // upload on cloudinary
  let assignmentPdf;
  if (pdfLocalPath) {
    assignmentPdf = await uploadOnCloudinary(pdfLocalPath);
  }

  // create assignment
  const assignmentCreated = await Assignment.create({
    title: title,
    dueDate: dueDate,
    grade: grade,
    description: description,
    subject: subject,
    totalMarks: totalMarks,
    pdfFile: assignmentPdf?.url,
    createdBy: req.user?._id,
    isPublished: true,
  });

  if (!assignmentCreated) {
    throw new ApiError(400, "Failed to create the Assignment");
  }
  // return the response to frontend
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
  const { title, dueDate, grade, description, subject, totalMarks } = req.body;
  const { assignmentId } = req.params;
  const updatedAssignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    {
      $set: {
        title,
        dueDate,
        grade,
        description,
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
// remove asignment
const removeAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid assignment ID");
  }
  // check assignment owner === user or not
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }
  if (
    assignment.createdBy.toString().toLowerCase() !==
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
      throw new ApiError(500, "Failed to delete associated PDF file");
    }
  }
  const deleteAssignment = await Assignment.findByIdAndDelete(id);
  if (!deleteAssignment) {
    throw new ApiError(500, "Failed to delete the assignment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "Assignment deleted successfully"));
});
//  submit assignment - student
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

// Controller function to get enum values for grades
const getGradesAndSubjects = (req, res, next) => {
  try {
    const gradeEnums = Assignment.schema.path("grade").enumValues;
    const subjectEnums = Assignment.schema.path("subject").enumValues;

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { grades: gradeEnums, subjects: subjectEnums },
          "Grades fetched Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching grades");
  }
};
const searchAssignment = asyncHandler(async (req, res) => {
  const { query, limit = 10, page = 1, sortBy, sortType, userId } = req.query;

  // search by title class , description, createdBy
  // if (!query) {
  //   throw new ApiError(401, "Enter something to search");
  // }
  const pipeline = [];
  // search with query
  if (query) {
    pipeline.push({
      // $search: {
      //   index: "assignment",
      //   text: {
      //     query: query,
      //     path: ["title", "description", "createdBy"],
      //   },
      // },
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }
  // check user id is valid or not
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(4000, "Not a valid user");
    } else {
      //  find the assignment by createdBy(teacher/user) - who created the assignment
      pipeline.push({
        $match: { createdBy: new mongoose.Types.ObjectId(userId) },
      });
    }
  }

  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({
      $sort: { createdAt: -1 },
    });
  }

  // use aggregation pipeline to join the user details with the assignment

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              fullname: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$createdBy",
    }
  );
  const options = {
    page: parseInt(page, 1),
    limit: parseInt(limit, 10),
  };
  // const assignemntAggregate = await Assignment.aggregate(pipeline);
  // const assignments = await Assignment.aggregatePaginate(
  //   assignemntAggregate,
  //   options
  // );

  const assignment = await Assignment.aggregatePaginate(
    Assignment.aggregate(pipeline),
    options
  );

  // return the response
  return res
    .status(201)
    .json(new ApiResponse("201", assignment, "Search data fetched"));
});
const getAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Not a valid assignment id");
  }

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, assignment, "Assignment fetched successfully")
      );
  } catch (error) {
    console.error("Error fetching assignment:", error.message);
    throw new ApiError(500, "An error occurred while fetching the assignment");
  }
});

export {
  createAssignment,
  submitAssignment,
  updateAssignment,
  updateAssignmentPdfFile,
  removeAssignment,
  getGradesAndSubjects,
  searchAssignment,
  getAssignmentById,
};
