import { readFileSync, writeFileSync } from 'node:fs';

const txtFile = process.argv[2] || 'tl2.txt';
const binFile = process.argv[3] || 'tl2.bin';

const lines = readFileSync(txtFile, 'utf8').split('\n');
let lineno = 0;
let colChecksum = [0, 0, 0, 0, 0, 0, 0, 0];
const data = new Uint8Array(lines.length * 8);
let pos = 0;
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
        console.error(`Column Checksum error #${lineno}: col=${i}, ${Number(colChecksum[i]).toString(16)}`);
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
  for (let col = 1; col < cols.length - 1; col++) {
    let n = parseInt(cols[col], 16);
    rowChecksum += n;
    colChecksum[col - 1] += n;
    data[pos++] = n;
  }
  const rowChecksumByOcr = parseInt(cols[cols.length - 1], 16);
  if (rowChecksumByOcr !== (rowChecksum & 0xff)) {
    console.error(`Row Checksum error #${lineno}: ${Number(rowChecksum).toString(16)}`);
  }
}
writeFileSync(binFile, data.subarray(0, pos));
