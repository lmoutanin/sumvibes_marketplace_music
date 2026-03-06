import Joi from "joi";

export const userSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
    address: Joi.string().min(5).max(500).allow(null, "").optional(),
    city: Joi.string().min(2).max(255).allow(null, "").optional(),
    postalCode: Joi.string().min(4).max(20).allow(null, "").optional(),
    country: Joi.string().min(2).max(255).allow(null, "").optional(),
}); 

export const itemSchema = Joi.object({
    item : Joi.string().required(),
    description: Joi.string().required(),
    quantity: Joi.number().required(),
    amount: Joi.number().required()
});

export const invoiceSchema = Joi.object({
    subtotal: Joi.number().required(),
    tax: Joi.number().required(),
    total: Joi.number().required(),
    invoice_nr: Joi.string().required(),
    method: Joi.string().required()
});