import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { types } from "util";

const assignementSchema = new Schema(
  {
    pdfFile: {
      type: String,
      required: true,
      index: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
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
    totalMarks: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

assignementSchema.plugin(mongooseAggregatePaginate);

export const Assignment = mongoose.model("Assignment", assignementSchema);
