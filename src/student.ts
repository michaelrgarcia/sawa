import { context } from "../context";
import { loginToSSB } from "./auth";
import { parseDate, sleep } from "./utils";

export async function checkRegistrationStatus(
  page: Awaited<ReturnType<typeof loginToSSB>>["page"]
) {
  await page.goto(
    "https://reg.oci.fhda.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=preReg",
    { waitUntil: "networkidle2" }
  );

  await page.click("#s2id_txt_term");
  await page.waitForSelector(".select2-result-label", { timeout: 3000 });

  const termElement = await page.evaluate(async (termName) => {
    const terms = Array.from(
      document.querySelectorAll(".select2-result-label")
    );

    const term = terms.find(
      (tm) => tm?.firstElementChild?.textContent === termName
    );

    if (term) {
      const selector = term.id;
      const termId = term.firstElementChild?.id;

      return { selector, termId };
    } else {
      return null;
    }
  }, process.env.FHDA_TERM!);

  if (!termElement || !termElement.termId) throw new Error("term not found");

  await page.click(`#${termElement.selector}`);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click("#term-go"),
  ]);

  const lines = await page.$$eval(
    ".reg-status-info .inline-display",
    (elements) => elements.map((el) => el.textContent?.trim() || "")
  );

  const rangeLine = lines.find((line) =>
    line.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} [APM]{2}/)
  );

  if (!rangeLine) {
    throw new Error("could not find registration window");
  }

  const [startStr] = rangeLine.split("-").map((part) => part.trim());
  const startTime = parseDate(startStr);

  if (!startTime) {
    throw new Error("failed to parse start time");
  }

  const now = new Date();

  if (now < startTime) {
    const waitMs = startTime.getTime() - now.getTime();

    console.log(`registration opens at ${startTime.toLocaleString()}`);
    console.log(`waiting ${Math.round(waitMs / 1000)} seconds...`);

    await sleep(waitMs);

    const newSession = await loginToSSB();

    return checkRegistrationStatus(newSession.page);
  }

  console.log("registration open!");

  context.termId = termElement.termId;
}
