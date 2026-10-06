import mongoose from "mongoose";

const featurePermissionSchema = new mongoose.Schema(
  {
    feature: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    featureLabel: {
      type: String,
      required: true,
    },
    create: {
      type: Boolean,
      default: false,
    },
    view: {
      type: Boolean,
      default: false,
    },
    update: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const roleMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Role code is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: [featurePermissionSchema],
  },
  {
    timestamps: true,
    collection: "role_master",
  }
);

export default mongoose.models.RoleMaster ||
  mongoose.model("RoleMaster", roleMasterSchema);
