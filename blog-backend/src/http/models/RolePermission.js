import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    featureLabel: {
      type: String,
      required: true,
    },
    permissions: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

rolePermissionSchema.index({ role: 1, feature: 1 }, { unique: true });

export default mongoose.models.RolePermission ||
  mongoose.model("RolePermission", rolePermissionSchema);
