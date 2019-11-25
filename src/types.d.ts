declare module "org-mode-parser" {
  export interface OrgNode {}
  export function makelist(filename: string, cb: (nodeList: OrgNode[]) => void): void;
}
