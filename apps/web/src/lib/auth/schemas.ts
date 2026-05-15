import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  email: z.string()
    .email('Ingresa un correo electrónico válido')
    .min(5, 'El correo es demasiado corto')
    .max(255, 'El correo es demasiado largo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
  aceptaPoliticaPrivacidad: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar la Política de Privacidad' }),
  }),
  aceptaUsoIA: z.literal(true, {
    errorMap: () => ({ message: 'Debes autorizar el uso de IA según la Res. 2654/2019' }),
  }),
  aceptaMarketing: z.literal(true).optional().or(z.literal(false)),
}).refine((data) => data.aceptaMarketing !== true, {
  message: 'El checkbox de marketing debe estar desmarcado por defecto',
  path: ['aceptaMarketing'],
});

export const loginSchema = z.object({
  email: z.string()
    .email('Ingresa un correo electrónico válido'),
  password: z.string()
    .min(1, 'La contraseña es requerida'),
  recordarme: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Ingresa un correo electrónico válido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});

export const twoFASchema = z.object({
  codigo: z.string()
    .min(6, 'El código debe tener 6 dígitos')
    .max(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type TwoFAInput = z.infer<typeof twoFASchema>;
