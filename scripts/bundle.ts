import path from 'path';
import { parseArgs } from 'util';
import { $ } from 'bun';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    version: {
      type: 'string',
      short: 'v',
    },
    export: {
      type: 'boolean',
      default: false,
      short: 'e',
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!('version' in values)) {
  throw new Error('Please provide a version');
}

const rootPath = path.join(import.meta.dirname, '..');
const webPath = path.join(rootPath, 'apps', 'web');
const serverPath = path.join(rootPath, 'apps', 'server');

await $`bun run build`.cwd(rootPath);

$.cwd(import.meta.dirname);

await $`rm -rf ./dist`;
await $`rm -rf ./release`;
await $`cp -r ${serverPath}/dist  .`;
await $`cp -r ${serverPath}/prisma  ./dist`;
await $`cp -r ${webPath}/dist  ./dist`;
await $`mv ./dist/dist ./dist/static`;

const packageJson = JSON.parse(await Bun.file(`${serverPath}/package.json`).text());
const json = {
  main: 'index.js',
  name: packageJson.name,
  version: packageJson.version,
  dependencies: {
    prisma: packageJson.dependencies.prisma,
    '@prisma/client': packageJson.dependencies['@prisma/client'],
  },
};
await $`echo ${JSON.stringify(json)} > ./dist/package.json`;

const imageName = `rent-house-server:${values.version}`;
await $`docker build -t ${imageName} .`;
await $`cp -r ${rootPath}/release .`;

$.cwd(`${import.meta.dirname}/release`);

if (values.export) {
  await $`docker save -o rent-house-image.tar ${imageName}`;
}
await $`mkdir data`;
await $`mkdir data/db`;
await $`mkdir data/server`;
await $`echo 'RENT_HOUSE_APP_IMAGE=${imageName}' > .env`;
