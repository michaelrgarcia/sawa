import { context } from "../context";
import { loginToSSB } from "./auth";
import { visitRegPage } from "./misc";
import signup from "./signup";
import { sleep } from "./utils";
import { sendNotification } from "./webhook";

// REMEMBER TO CREATE NEW REPO
// MY USER AND PASSWORD ARE IN THE PRIVATE REPO'S
// ENV FILE

async function checkEnrollmentData(
  page: Awaited<ReturnType<typeof loginToSSB>>["page"],
  crn: string
): Promise<void> {
  await page.click("h3#enrollmentInfo > a");
  await page.waitForSelector(
    '#classDetailsContentDetailsDiv > section[aria-labelledby="enrollmentInfo"]'
  );

  const enrollmentInfo = await page.evaluate(() => {
    const asHtml = document.querySelector(
      '#classDetailsContentDetailsDiv > section[aria-labelledby="enrollmentInfo"]'
    )?.outerHTML;

    return asHtml;
  });

  if (!enrollmentInfo) throw new Error("failed to get enrollment info");

  const enrollmentSeatsAvailable =
    /Enrollment Seats Available:<\/span>\s*<span[^>]*>(\d+)/.exec(
      enrollmentInfo
    )?.[1] || "0";
  const waitlistCapacity =
    /Waitlist Capacity:<\/span>\s*<span[^>]*>(\d+)/.exec(enrollmentInfo)?.[1] ||
    "0";
  const waitlistActual =
    /Waitlist Actual:<\/span>\s*<span[^>]*>(\d+)/.exec(enrollmentInfo)?.[1] ||
    "0";
  const waitlistSeatsAvailable =
    /Waitlist Seats Available:<\/span>\s*<span[^>]*>(\d+)/.exec(
      enrollmentInfo
    )?.[1] || "0";

  const enroll = parseInt(enrollmentSeatsAvailable);
  const wlCap = parseInt(waitlistCapacity);
  const wlAct = parseInt(waitlistActual);
  const wlAvail = parseInt(waitlistSeatsAvailable);

  console.log(enroll, wlCap, wlAct, wlAvail);

  if ((wlCap > wlAct && wlAvail > 0) || (enroll > 0 && wlAvail > 0)) {
    await sendNotification(
      "Watch Task",
      `[${crn}] ${wlAvail} waitlist spot(s) available`
    );

    context.waitlistTask = true;
    context.crns = [crn];

    await signup();
  } else {
    if (enroll >= 1 && wlAvail === 0) {
      console.log(`[${crn}] - (waitlist opening soon)`);
    } else {
      console.log(`[${crn}] - (no seats available)`);
    }

    await sleep(Number(process.env.WATCH_COOLDOWN));

    return checkEnrollmentData(page, crn);
  }
}

async function initializeWatchContext(
  browser: Awaited<ReturnType<typeof loginToSSB>>["browser"],
  crn: string
) {
  const page = await browser.newPage();

  await visitRegPage(page);

  await page.click("#enterCRNs-tab");
  await page.type("#txt_crn1", crn);
  await page.click("#addCRNbutton");

  await page.waitForSelector(".schedule-class-pending");

  const linkAttributes = await page.evaluate((crn) => {
    const links = Array.from(
      document.querySelectorAll(".section-details-link")
    );

    const crnLink = links.find((link) => {
      const attributes = (link as HTMLAnchorElement).dataset.attributes?.split(
        ","
      );

      if (!attributes?.includes(crn)) {
        return null;
      }

      return link;
    });

    if (!crnLink) return null;

    return (crnLink as HTMLAnchorElement).dataset.attributes;
  }, crn);

  if (!linkAttributes) {
    await page.close();
    throw new Error("error getting enrollment data");
  }

  const elementHandle = await page.$(
    `.section-details-link[data-attributes="${linkAttributes}"]`
  );

  if (!elementHandle) throw new Error("could not initialize watch context");

  const box = await elementHandle.boundingBox();

  if (!box) throw new Error("could not initialize watch context");

  await page.mouse.click(box.x + 1, box.y + box.height / 2);

  await checkEnrollmentData(page, crn);

  await page.close();
}

export async function watch(): Promise<void> {
  const { browser } = await loginToSSB();

  const results = await Promise.allSettled(
    context.crns.map((crn) => initializeWatchContext(browser, crn))
  );

  const errors = results
    .filter((res) => res.status === "rejected")
    .map((res) => (res as PromiseRejectedResult).reason);

  if (errors.length > 0) {
    console.error("some CRNs failed:", errors);
  }

  await browser.close();
}
