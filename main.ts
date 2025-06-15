import signup from "./src/signup";
import { watch } from "./src/watch";

async function main() {
  const mode = process.env.MODE!;

  switch (mode) {
    case "Signup":
      await signup();
      break;
    case "Watch":
      await watch();
      break;
  }
}

main().catch(console.error);
