import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { types } from "util";

const assignementSchema = new Schema(
  {
    pdfFile: {
      type: String, //string from cloudinary
      required: function () {
        return !this.textAsssignment;
      },
      index: true,
    },
    textAsssignment: {
      type: String, // if user don't want to add padf file then he can just the text as assignment
      required: function () {
        return !this.pdfFile;
      },
      index: true,
    },
    assignmentAnswer: [
      {
        type: String,
        required: true,
      },
    ],
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },

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
        "islam parichay",
        "arabic",
        "work education",
      ],
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
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
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

assignementSchema.plugin(mongooseAggregatePaginate);

export const Assignment = mongoose.model("Assignment", assignementSchema);
