import { gzipSync } from 'node:zlib';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import ts from 'typescript';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fromRoot = (...parts) => resolve(projectRoot, ...parts);

await rm(fromRoot('dist'), { recursive: true, force: true });
await mkdir(fromRoot('dist'), { recursive: true });

const shared = {
  bundle: true,
  absWorkingDir: projectRoot,
  entryPoints: [fromRoot('src/index.ts')],
  logLevel: 'info',
  sourcemap: true,
  target: ['es2020'],
};

await Promise.all([
  build({ ...shared, format: 'esm', outfile: fromRoot('dist/index.js') }),
  build({ ...shared, format: 'cjs', outfile: fromRoot('dist/index.cjs') }),
  build({
    bundle: true,
    absWorkingDir: projectRoot,
    entryPoints: [fromRoot('src/core-entry.ts')],
    format: 'esm',
    outfile: fromRoot('dist/core-entry.js'),
    sourcemap: true,
    target: ['es2020'],
  }),
  build({
    bundle: true,
    absWorkingDir: projectRoot,
    entryPoints: [fromRoot('src/core-entry.ts')],
    format: 'esm',
    minify: true,
    outfile: fromRoot('dist/chartix.core.min.js'),
    target: ['es2020'],
  }),
  build({
    bundle: true,
    absWorkingDir: projectRoot,
    entryPoints: [fromRoot('src/embed/schema.ts')],
    format: 'esm',
    outfile: fromRoot('dist/embed/schema.js'),
    target: ['es2020'],
  }),
  build({
    bundle: true,
    absWorkingDir: projectRoot,
    entryPoints: [fromRoot('src/embed/autoload.ts')],
    format: 'esm',
    outfile: fromRoot('dist/embed/autoload.js'),
    sourcemap: true,
    target: ['es2020'],
  }),
  build({
    bundle: true,
    absWorkingDir: projectRoot,
    entryPoints: [fromRoot('src/browser.ts')],
    format: 'iife',
    outfile: fromRoot('dist/chartix.global.js'),
    sourcemap: true,
    target: ['es2020'],
  }),
  build({
    bundle: true,
    absWorkingDir: projectRoot,
    entryPoints: [fromRoot('src/browser.ts')],
    format: 'iife',
    minify: true,
    outfile: fromRoot('dist/chartix.min.js'),
    target: ['es2020'],
  }),
]);
await copyFile(
  fromRoot('src/embed/chartix.schema.json'),
  fromRoot('dist/embed/chartix.schema.json'),
);

const parsed = ts.getParsedCommandLineOfConfigFile(
  fromRoot('tsconfig.json'),
  { emitDeclarationOnly: true },
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  },
);

if (!parsed) throw new Error('Unable to parse tsconfig.json');
const program = ts.createProgram(parsed.fileNames, parsed.options);
const result = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics);
if (diagnostics.length > 0) {
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => ts.sys.newLine,
    }),
  );
}

const [coreBytes, libraryBytes, embedBytes] = await Promise.all([
  readFile(fromRoot('dist/chartix.core.min.js')),
  readFile(fromRoot('dist/index.js')),
  readFile(fromRoot('dist/chartix.min.js')),
]);
const report = {
  generatedAt: new Date().toISOString(),
  core: {
    rawBytes: coreBytes.byteLength,
    gzipBytes: gzipSync(coreBytes).byteLength,
    budgetBytes: 35 * 1024,
  },
  library: {
    rawBytes: libraryBytes.byteLength,
    gzipBytes: gzipSync(libraryBytes).byteLength,
    budgetBytes: 72 * 1024,
  },
  embed: {
    rawBytes: embedBytes.byteLength,
    gzipBytes: gzipSync(embedBytes).byteLength,
    budgetBytes: 40 * 1024,
  },
};
await writeFile(fromRoot('dist/bundle-size.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.core.gzipBytes > report.core.budgetBytes) {
  throw new Error(
    `Core bundle is ${report.core.gzipBytes} bytes gzipped; budget is ${report.core.budgetBytes}.`,
  );
}
if (report.library.gzipBytes > report.library.budgetBytes) {
  throw new Error(
    `Full library is ${report.library.gzipBytes} bytes gzipped; budget is ${report.library.budgetBytes}.`,
  );
}
if (report.embed.gzipBytes > report.embed.budgetBytes) {
  throw new Error(
    `Embed bundle is ${report.embed.gzipBytes} bytes gzipped; budget is ${report.embed.budgetBytes}.`,
  );
}

console.log(`Core bundle: ${(report.core.gzipBytes / 1024).toFixed(2)} KB gzipped`);
console.log(`Full library: ${(report.library.gzipBytes / 1024).toFixed(2)} KB gzipped`);
console.log(`Embed bundle: ${(report.embed.gzipBytes / 1024).toFixed(2)} KB gzipped`);
