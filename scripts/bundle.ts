import path from 'path';
import { $ } from 'bun';

const rootPath = path.join(import.meta.dirname, '..');
const webPath = path.join(rootPath, 'apps', 'web');
const serverPath = path.join(rootPath, 'apps', 'server');

await $`bun run build`.cwd(rootPath);

$.cwd(import.meta.dirname);

await $`rm -rf ./dist`;
await $`cp -r ${serverPath}/dist  .`;
await $`cp -r ${serverPath}/prisma  ./dist`;
await $`cp -r ${webPath}/dist  ./dist`;
await $`mv ./dist/dist ./dist/static`;

const env = `NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:yEjJFzZJ0M5wpDh@db:5432/rent_house?schema=public
STATIC_DIRECTORY=/rent-house/scripts/dist/static
IMAGES_DIRECTORY=/rent-house-data/images
PASSWORD_FILE=/rent-house-data/password.txt
AUTO_MIGRATE=true
`;

await $`echo ${env} > ./dist/.env`;
