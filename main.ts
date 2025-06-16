import { fork } from "child_process";
import { resolve } from "path";
import { context } from "./context";
import signup from "./src/signup";

const watchFile = resolve(__dirname, "./src/watch.ts");

async function main() {
  const mode = process.env.MODE!;

  switch (mode) {
    case "Signup":
      await signup();
      break;
    case "Watch":
      for (const crn of context.crns) {
        const child = fork(watchFile, [crn], {
          execPath: "tsx",
        });

        child.on("exit", (code) => {
          console.log(`[CRN ${crn}] exited with code ${code}`);
        });

        child.on("error", (err) => {
          console.error(`[CRN ${crn}] process error:`, err);
        });
      }

      break;
  }
}

main().catch(console.error);
