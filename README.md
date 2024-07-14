# rclone-file-decrypter

A site that can locally decrypt files that were encrypted via rclone. 

Available via github pages at [https://josh-tx.github.io/rclone-file-decrypter/](https://josh-tx.github.io/rclone-file-decrypter/)

## How it works

This primarily uses [rclone-js](https://github.com/FWeinb/rclone-js). All operations are done locally, meaning the file gets converted to a bite array, decrypted, and "downloaded" all via javascript without ever going to a server. 

I used Vite and VueJS to make this site. I had trouble with the build because of the rclone package, so I just used their [browser bundler](https://unpkg.com/rclone/dist/rclone.umd.min.js). Admittedly a minified bundle makes it hard to see what's going on, so I understand having privacy concerns (I would too if someone else made it).

## Why should I use this?

Ultimately, it's a tradeoff between simplicity & convenience versus privacy & efficiency. I made this because I wanted my family to be able to decrypt files after downloading them directly from our cloud backup provider.



