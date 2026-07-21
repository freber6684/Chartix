import { gzipSync } from 'node:zlib';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import ts from 'typescript';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

const shared = {
  bundle: true,
  entryPoints: ['src/index.ts'],
  logLevel: 'info',
  sourcemap: true,
  target: ['es2020'],
};

await Promise.all([
  build({ ...shared, format: 'esm', outfile: 'dist/index.js' }),
  build({ ...shared, format: 'cjs', outfile: 'dist/index.cjs' }),
  build({
    bundle: true,
    entryPoints: ['src/embed/autoload.ts'],
    format: 'esm',
    outfile: 'dist/embed/autoload.js',
    sourcemap: true,
    target: ['es2020'],
  }),
  build({
    bundle: true,
    entryPoints: ['src/browser.ts'],
    format: 'iife',
    outfile: 'dist/chartix.global.js',
    sourcemap: true,
    target: ['es2020'],
  }),
  build({
    bundle: true,
    entryPoints: ['src/browser.ts'],
    format: 'iife',
    minify: true,
    outfile: 'dist/chartix.min.js',
    target: ['es2020'],
  }),
]);

const parsed = ts.getParsedCommandLineOfConfigFile(
  'tsconfig.json',
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

const bundleBytes = await readFile('dist/chartix.min.js');
const report = {
  generatedAt: new Date().toISOString(),
  rawBytes: bundleBytes.byteLength,
  gzipBytes: gzipSync(bundleBytes).byteLength,
  budgetBytes: 25 * 1024,
};
await writeFile('dist/bundle-size.json', `${JSON.stringify(report, null, 2)}\n`);

if (report.gzipBytes > report.budgetBytes) {
  throw new Error(
    `Embed bundle is ${report.gzipBytes} bytes gzipped; budget is ${report.budgetBytes}.`,
  );
}

console.log(`Embed bundle: ${(report.gzipBytes / 1024).toFixed(2)} KB gzipped`);
