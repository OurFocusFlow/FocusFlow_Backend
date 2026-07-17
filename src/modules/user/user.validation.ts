import { z } from "zod";

/**
 * Update Profile Validation Schema
 */
export const updateProfileSchema = {
    body: z.strictObject({
        firstName: z
            .string()
            .min(2, { message: "First name must be at least 2 characters" })
            .max(50, { message: "First name must not exceed 50 characters" })
            .regex(/^[a-zA-Z\s\-']+$/, { message: "First name contains invalid characters" })
            .optional(),
        
        lastName: z
            .string()
            .min(2, { message: "Last name must be at least 2 characters" })
            .max(50, { message: "Last name must not exceed 50 characters" })
            .regex(/^[a-zA-Z\s\-']+$/, { message: "Last name contains invalid characters" })
            .optional(),
        
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
            .optional()
            .nullable(),
        
        profilePicture: z
            .string()
            .url({ message: "Profile picture must be a valid URL" })
            .optional()
            .nullable(),
        
        gender: z
            .number()
            .min(0, { message: "Gender must be 0 (MALE) or 1 (FEMALE)" })
            .max(1, { message: "Gender must be 0 (MALE) or 1 (FEMALE)" })
            .optional(),
    }).refine(
        (data) => {
            // At least one field must be provided
            return Object.keys(data).some(key => data[key as keyof typeof data] !== undefined);
        },
        {
            message: "At least one field must be provided for update",
            path: ["body"]
        }
    )
};

/**
 * Update Password Validation Schema
 */
export const updatePasswordSchema = {
    body: z
        .strictObject({
            currentPassword: z
                .string()
                .min(5, { message: "Current password must be at least 5 characters" }),
            
            newPassword: z
                .string()
                .min(8, { message: "New password must be at least 8 characters" })
                .regex(/^(?=.*[a-z])/, { message: "Password must contain at least one lowercase letter" })
                .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least one uppercase letter" })
                .regex(/^(?=.*\d)/, { message: "Password must contain at least one number" })
                .regex(/^(?=.*[@$!%*?&])/, { message: "Password must contain at least one special character" }),
            
            confirmPassword: z
                .string()
                .min(8, { message: "Confirm password must be at least 8 characters" }),
        })
        .refine(
            (data) => data.newPassword === data.confirmPassword,
            {
                message: "Passwords do not match",
                path: ["confirmPassword"]
            }
        )
        .refine(
            (data) => data.currentPassword !== data.newPassword,
            {
                message: "New password must be different from current password",
                path: ["newPassword"]
            }
        )
};