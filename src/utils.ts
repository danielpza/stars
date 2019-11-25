import { existsSync, readFileSync, writeFileSync } from "fs";

export function readFile(file: string) {
  if (!existsSync(file)) {
    return undefined;
  }
  return readFileSync(file, "utf8").toString();
}

export function appendFile(file: string, content: string) {
  const prev = readFile(file) ?? "";
  writeFileSync(file, prev + content);
}
