import { z } from "zod";


export const registerSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must include at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Must include at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Must include at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must include at least one special character",
      }),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  export type RegisterTypes = z.infer<typeof registerSchema>;

  export type RegisterType = Omit<RegisterTypes, "confirmPassword">;


  export const verifyTokenSchema = z
  .object({
    token: z.string(),
    code: z
      .string()
     
  })
  
  export type verifyTypes = z.infer<typeof verifyTokenSchema>;

  export const LoginSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
  })

  export type LoginTypes = z.infer<typeof LoginSchema>;

