import Octokit = require("@octokit/rest");
import { writeFileSync } from "fs";
import { readFile, appendFile } from "./utils";

const octokit = new Octokit();

interface Info {
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
}

class Generator {
  categories = new Map<string, Info[]>();
  add(info: Info) {
    const category = info.language ?? "Uncategorized";
    const prev = this.categories.get(category) ?? [];
    prev.push(info);
    this.categories.set(category, prev);
  }
  toOrg() {
    if (this.categories.size === 0) return "";
    let result = "* New\n\n";
    this.categories.forEach((infos, key) => {
      result += `** ${key}\n\n`;
      result += infos
        .map(
          ({ full_name, description, html_url }) =>
            `- [[${html_url}][${full_name}]] ${description ?? ""}`
        )
        .join("\n");
      result += "\n\n";
    });
    return result;
  }
  toMd() {
    if (this.categories.size === 0) return "";
    let result = "# New\n\n";
    this.categories.forEach((infos, key) => {
      result += `## ${key}\n\n`;
      result += infos
        .map(
          ({ full_name, description, html_url }) =>
            `- [${full_name}](${html_url}) ${description ?? ""}`
        )
        .join("\n");
      result += "\n\n";
    });
    return result;
  }
}

async function getAllStars(params: { username: string }) {
  let result: Octokit.Response<
    Octokit.ActivityListReposStarredByUserResponse
  >["data"] = [];
  for (let page = 0; ; page++) {
    const { data: stars } = await octokit.activity.listReposStarredByUser({
      ...params,
      per_page: 100,
      page
    });
    if (stars.length === 0) break;
    result = result.concat(stars);
    console.error(`loaded ${page * 100 + stars.length} pages`);
  }
  return result;
}

export async function main({
  username,
  ext,
  cacheFile,
  outFile
}: {
  username: string;
  cacheFile: string;
  outFile: string;
  ext: string;
}) {
  const prev = new Set(JSON.parse(readFile(cacheFile) ?? "[]"));
  const stars = await getAllStars({ username });
  const generator = new Generator();
  const newStars = stars.filter(({ full_name }) => !prev.has(full_name));
  newStars.forEach(({ full_name, description, html_url, language }) => {
    generator.add({ full_name, description, html_url, language });
    prev.add(full_name);
  });
  appendFile(outFile, ext === "md" ? generator.toMd() : generator.toOrg());
  writeFileSync(cacheFile, JSON.stringify([...prev]));
}
