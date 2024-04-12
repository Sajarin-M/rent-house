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
