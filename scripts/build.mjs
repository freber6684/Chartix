import { gzipSync } from 'node:zlib';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

const bundleBytes = await readFile(fromRoot('dist/chartix.min.js'));
const report = {
  generatedAt: new Date().toISOString(),
  rawBytes: bundleBytes.byteLength,
  gzipBytes: gzipSync(bundleBytes).byteLength,
  budgetBytes: 25 * 1024,
};
await writeFile(fromRoot('dist/bundle-size.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.gzipBytes > report.budgetBytes) {
  throw new Error(
    `Embed bundle is ${report.gzipBytes} bytes gzipped; budget is ${report.budgetBytes}.`,
  );
}

console.log(`Embed bundle: ${(report.gzipBytes / 1024).toFixed(2)} KB gzipped`);
