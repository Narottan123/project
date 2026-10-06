import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 250,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
    },
    excerpt: {
      type: String,
      default: "",
      maxlength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
      index: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for comments count (populated optionally)
postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  count: true,
  match: { isDeleted: false },
});

// Compound indexes for query optimization
postSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, category: 1 });
postSchema.index({ isDeleted: 1, tags: 1 });
postSchema.index({ title: "text", content: "text", excerpt: "text" });

const Post = mongoose.model("Post", postSchema);

export default Post;
