import { readFileSync } from "node:fs";

const profileUrl = new URL("../data/verified-profile.json", import.meta.url);

export const VERIFIED_PROFILE = JSON.parse(readFileSync(profileUrl, "utf8"));
