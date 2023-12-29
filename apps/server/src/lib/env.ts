import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().min(1),
  IMAGES_DIRECTORY: z.string().min(1),
  PASSWORD_FILE: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const env = schema.parse(process.env);

export const isDev = env.NODE_ENV === 'development';
