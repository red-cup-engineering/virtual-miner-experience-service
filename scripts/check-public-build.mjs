import { makeTemporaryDirectory } from "@red-cup-engineering/computer-file-engineering-services-section/temporary-directory";
// node scripts/check-public-build.mjs path/to/site.json original/assist public-services-section
import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";

import { dirname, join, resolve } from 'node:path';
import { build } from './build.mjs';

const [configPath, assistRoot, publicRoot] = process.argv.slice(2).map(p => resolve(p));
if (!publicRoot) throw new Error('Expected site.json, ASSIST root and Public root');
const site = JSON.parse(await readFile(configPath, 'utf8'));
const temporaryDirectory = makeTemporaryDirectory("public-miner-check");
try {
const temp = temporaryDirectory.path;
try {
  const current = await build({configPath, assistRoot, publicRoot, outPath:join(temp, 'current')});
  const oldRoot = join(temp, 'original');
  const oldRecord = join(oldRoot, site.serviceInstanceSource.recordPath);
  await mkdir(dirname(oldRecord), {recursive:true});
  await copyFile(join(dirname(configPath), 'assist-instance.json'), oldRecord);
  const old = await build({configPath, assistRoot, publicRoot:oldRoot, outPath:join(temp, 'old')});
  assert.deepEqual(current.files, old.files);
  for (const path of current.files) {
    assert.deepEqual(await readFile(join(current.dest, path)), await readFile(join(old.dest, path)), path);
  }
  await writeFile(oldRecord, '{}');
  await assert.rejects(build({configPath, assistRoot, publicRoot:oldRoot, outPath:join(temp, 'invalid')}),
    /does not match the selected Git blob/);
  console.log('Current and historical Public mounts produced ' + current.files.length + ' identical artifacts. Altered pinned bytes were rejected.');
} finally { await rm(temp, {recursive:true, force:true}); }

} finally {
  temporaryDirectory.remove();
}
