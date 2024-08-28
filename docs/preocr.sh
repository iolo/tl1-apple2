#!/bin/bash
# preprocessing images for better OCR
for fn in *.jpg; do
  echo $fn
  bn=$(basename $fn .jpg)
  tn=temp${bn}.png
  convert -resize x1920 -density 300 -quality 100 ${fn} ${tn}
  textcleaner -g -e normalize -f 30 -o 12 -s 2 ${tn} ${bn}.png
  rm ${tn}
done
