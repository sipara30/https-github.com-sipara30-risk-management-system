import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load env: prefer OS, fallback to backend/.env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

console.log('Running Prisma db push...');
exec('npx prisma db push', { env: process.env, windowsHide: true }, (error, stdout, stderr) => {
  if (error) {
    console.error('db push failed:', error.message);
    if (stderr) console.error(stderr);
    process.exit(1);
  }
  if (stdout) console.log(stdout);
  console.log('✅ Prisma db push completed.');
}); 