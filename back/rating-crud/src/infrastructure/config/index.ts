import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  databaseUrl: requireEnv('DATABASE_URL'),
  interpreterUrl: requireEnv('INTERPRETER_URL'),
} as const;
