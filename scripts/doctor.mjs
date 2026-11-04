import { spawnSync } from "node:child_process";
export function pythonCommand() {
  const candidates = [
    process.env.FC_PYTHON,
    process.platform === "win32" ? "python" : "python3",
    "python3",
    "python",
  ].filter(Boolean);
  for (const command of candidates) {
    const result = spawnSync(command, ["--version"], { encoding: "utf8" });
    if (
      result.status === 0 &&
      /Python 3\.(?:1[1-9]|[2-9][0-9])\./.test(result.stdout + result.stderr)
    )
      return command;
  }
  throw new Error(
    "Install Python 3.11 or later from https://www.python.org/downloads/ and add it to PATH. On Windows, check “Add python.exe to PATH” in the installer.",
  );
}
export function check() {
  if (![22, 24, 26].includes(Number(process.versions.node.split(".")[0])))
    throw new Error("Install a supported Node.js LTS version (22, 24 or 26) from https://nodejs.org/");
  return pythonCommand();
}
if (process.argv[1]?.endsWith("doctor.mjs")) {
  try {
    console.log(`Node ${process.versions.node}; Python executable: ${check()}`);
    console.log(
      "Install Google Chrome or Microsoft Edge and select it in the mailbox profile.",
    );
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
