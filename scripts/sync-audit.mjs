// Read-only cloud inspection: never calls sync(), writes state, or acknowledges events.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FirebaseSync } from "../src/firebase-sync.mjs";
import { auditFirebaseSync } from "../src/firebase-audit.mjs";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDirectory = path.resolve(process.env.FC_DATA_DIR || path.join(root, "data"));
const state = JSON.parse(fs.readFileSync(path.join(dataDirectory, "state.json"), "utf8"));
const sync = new FirebaseSync({ state, dataDirectory });
try {
  console.log(JSON.stringify(await auditFirebaseSync(sync), null, 2));
} catch (error) {
  console.error(JSON.stringify({ readOnly: true, complete: false, error: error.message }));
  process.exitCode = 1;
} finally { await sync.app?.delete(); }
