import { context } from "../context";
import { loginToSSB } from "./auth";
import { genSessionId } from "./utils";

export async function getTermId(
  page: Awaited<ReturnType<typeof loginToSSB>>["page"]
) {
  await page.goto(
    "https://reg.oci.fhda.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=preReg",
    { waitUntil: "networkidle2" }
  );

  await page.click("#s2id_txt_term");

  await page.waitForSelector(".select2-result-label", { timeout: 3000 });

  const termId = await page.evaluate(async (termName) => {
    const terms = Array.from(
      document.querySelectorAll(".select2-result-label")
    );

    const term = terms.find(
      (tm) => tm?.firstElementChild?.textContent === termName
    );

    if (term) {
      const termId = term.firstElementChild?.id;

      return termId;
    } else {
      return null;
    }
  }, process.env.FHDA_TERM!);

  if (!termId) throw new Error("term not found");

  return termId;
}

export async function visitRegPage(
  page: Awaited<ReturnType<typeof loginToSSB>>["page"]
) {
  await page.goto(
    "https://reg.oci.fhda.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=registration",
    { waitUntil: "networkidle2" }
  );

  await page.click("#s2id_txt_term");
  await page.waitForSelector(".select2-result-label", { timeout: 3000 });

  const termElementSelector = await page.evaluate(async (termName) => {
    const terms = Array.from(
      document.querySelectorAll(".select2-result-label")
    );

    const termElement = terms.find(
      (tm) => tm?.firstElementChild?.textContent === termName
    );

    if (termElement) {
      return termElement.id;
    } else {
      return null;
    }
  }, process.env.FHDA_TERM!);

  if (!termElementSelector) throw new Error("term not found");

  await page.click(`#${termElementSelector}`);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click("#term-go"),
  ]);

  context.uniqueSessionId = genSessionId();
}
