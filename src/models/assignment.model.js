import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const assignementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    pdfFile: {
      type: String, //string from cloudinary
      index: true,
    },
    description: {
      type: String,
      index: true,
    },
    assignmentAnswer: [
      {
        type: String,
        index: true,
      },
    ],

    grade: {
      type: String,
      required: true,
      index: true,
      enum: ["v", "vi", "vii", "viii", "ix", "x", "xi", "xii"],
    },
    subject: {
      type: String,
      required: true,
      index: true,
      enum: [
        "mathematics",
        "english",
        "history",
        "physics",
        "physical science",
        "life science",
        "biology",
        "geography",
        "computer application",
        "chemistry",
        "bengali",
        "arabic",
        "work education",
      ],
    },
    dueDate: {
      type: String,
      required: true,
      index: true,
    },
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    submittedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalMarks: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

assignementSchema.plugin(mongooseAggregatePaginate);

export const Assignment = mongoose.model("Assignment", assignementSchema);
