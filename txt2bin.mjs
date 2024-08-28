import { readFileSync, writeFileSync } from 'node:fs';

if (process.argv.length < 4) {
  console.log('Usage: node txt2bin.mjs <txt-file> <bin-file>');
  process.exit(1);
}

const txtFile = process.argv[2];
const binFile = process.argv[3];

const lines = readFileSync(txtFile, 'utf8').split('\n');
const data = new Uint8Array(lines.length * 8);
let lineno = 0;
let pos = 0;
let colChecksum = [0, 0, 0, 0, 0, 0, 0, 0];

for (const line of lines) {
  ++lineno;
  const cols = line.split(/\W+/, 1 + 8 + 1); // addr + 8 bytes + checksum
  if (cols.length < 3) {
    continue;
  }
  console.log(line);
  if (cols[0] === 'SUM') {
    let pageChecksum = 0;
    for(let i = 0; i < 8; i++) {
      const colChecksumByOcr = parseInt(cols[i + 1], 16);
      if (colChecksumByOcr !== (colChecksum[i] & 0xff)) {
        console.error(`Column Checksum error #${lineno}:${i}: ${Number(colChecksum[i]).toString(16)}`);
      }
      pageChecksum += colChecksum[i];
      colChecksum[i] = 0;
    }
    const pageChecksumByOcr = parseInt(cols[cols.length - 1], 16);
    if (pageChecksumByOcr !== (pageChecksum & 0xff)) {
      console.error(`Page Checksum error #${lineno}: ${Number(pageChecksum).toString(16)}`);
    }
    continue;
  }
  let rowChecksum = 0;
  const leftPad = (1 + 8 + 1) - cols.length;
  for (let i = 0; i < 8; i ++) {
    if (i < leftPad) {
      continue;
    }
    let n = parseInt(cols[i + 1 - leftPad], 16);
    rowChecksum += n;
    colChecksum[i] += n;
    data[pos++] = n;
  }
  const rowChecksumByOcr = parseInt(cols[cols.length - 1], 16);
  if (rowChecksumByOcr !== (rowChecksum & 0xff)) {
    console.error(`Row Checksum error #${lineno}: ${Number(rowChecksum).toString(16)}`);
  }
}
writeFileSync(binFile, data.subarray(0, pos));
