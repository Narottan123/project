import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters long",
    "any.required": "Name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("admin", "user").default("user"),
  avatar: Joi.string().uri().allow("", null).optional(),
  bio: Joi.string().max(300).allow("", null).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});

export const socialLoginSchema = Joi.object({
  provider: Joi.string().valid("google", "facebook").required().messages({
    "any.required": "Provider is required (google or facebook)",
  }),
  token: Joi.string().allow("", null).optional(),
  credential: Joi.string().allow("", null).optional(),
  email: Joi.string().email().allow("", null).optional(),
  name: Joi.string().allow("", null).optional(),
  id: Joi.string().allow("", null).optional(),
  avatar: Joi.string().allow("", null).optional(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token is required",
    "any.required": "Refresh token is required",
  }),
});

export const validateRequest = (schema) => {
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
