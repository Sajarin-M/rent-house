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
await $`mkdir -p ./dist/data`;
await $`cp -r ${webPath}/dist  ./dist/data`;
await $`mv ./dist/data/dist ./dist/data/static`;
await $`echo 'NODE_ENV="production"' > ./dist/.env`;
await $`cat ${serverPath}/.env.example >> ./dist/.env`;
