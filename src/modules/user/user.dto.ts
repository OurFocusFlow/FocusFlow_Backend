import { z } from "zod";
import { updateProfileSchema, updatePasswordSchema } from "./user.validation";

export type UpdateProfileDto = z.infer<typeof updateProfileSchema.body>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema.body>;