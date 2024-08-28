#!/bin/bash
set -e
set -x

# build bin file
#node txt2bin.mjs maso_8705_082-097/postocr/tl1.txt tl1.bin
#node txt2bin.mjs maso_8705_082-097/postocr/tl2.txt tl2.bin

# make disk image
ac.sh -d tl1.dsk tl1
ac.sh -d tl1.dsk tl2
ac.sh -d tl1.dsk tl1.bas
# BSAVE TL1,A$8FD,L$1703
ac.sh -p tl1.dsk tl1 B 0x8fd < tl1.bin
# BSAVE TL2,A$7E00,$0500
ac.sh -p tl1.dsk tl2 B 0x7e00 < tl2.bin
ac.sh -bas tl1.dsk tl1.bas < tl1.bas

# run emulator
# mii_emu_gl -d 6:1:tl1.dsk
# linapple -b --d2 tl1.dsk
