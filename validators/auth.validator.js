const z = require("zod");

const signupSchema = z.object({
    name: z.string().trim().min(1),

    email: z.string().email("Invalid Email Format"),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least 1 character in Uppercase/Capital"
        )
        .regex(
            /[0-9]/,
            "Password must contain atleast one numeric chracter"
        )
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

module.exports = {
    signupSchema,
    loginSchema
};