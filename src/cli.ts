#!/usr/bin/env node
import yargs from "yargs";
import { main } from ".";

const { username, cacheFile, outFile, ext } = yargs.options({
  username: { type: "string", demandOption: true },
  cacheFile: { type: "string", default: "./.stars.json" },
  outFile: { type: "string", default: "./stars.md" },
  ext: { choices: ["md", "org"], default: "md" }
}).argv;

main({ username, cacheFile, outFile, ext }).catch(err => {
  console.error(err);
  process.exit(1);
});
