import Joi from "joi";

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Comment content cannot be empty",
    "string.min": "Comment must have at least 1 character",
    "string.max": "Comment cannot exceed 1000 characters",
    "any.required": "Comment content is required",
  }),
  postId: Joi.string().optional(),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Comment content cannot be empty",
    "string.min": "Comment must have at least 1 character",
    "string.max": "Comment cannot exceed 1000 characters",
    "any.required": "Comment content is required",
  }),
});

export const validateCommentRequest = (schema) => {
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
