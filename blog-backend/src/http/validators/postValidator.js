import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(250).required().messages({
    "string.empty": "Post title cannot be empty",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 250 characters",
    "any.required": "Post title is required",
  }),
  content: Joi.string().trim().min(10).required().messages({
    "string.empty": "Post content cannot be empty",
    "string.min": "Post content must be at least 10 characters",
    "any.required": "Post content is required",
  }),
  excerpt: Joi.string().trim().max(500).allow("", null).optional(),
  category: Joi.string().trim().max(100).default("General").optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().max(50)),
    Joi.string().trim()
  ).optional(),
  coverImage: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("published", "draft").default("published"),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(250).optional(),
  content: Joi.string().trim().min(10).optional(),
  excerpt: Joi.string().trim().max(500).allow("", null).optional(),
  category: Joi.string().trim().max(100).optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().max(50)),
    Joi.string().trim()
  ).optional(),
  coverImage: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("published", "draft").optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided to update the post",
});

export const validatePostRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: errorMessages[0],
        errors: errorMessages,
      });
    }
    req.body = value;
    next();
  };
};
