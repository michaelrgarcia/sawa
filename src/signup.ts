import { loginToSSB } from "./auth";
import { checkRegistrationStatus } from "./student";

import { context } from "../context";
import { visitRegPage } from "./misc";
import type { AddCourse, Model } from "./types/responses";

export async function addCourse(
  crn: string,
  page: Awaited<ReturnType<typeof loginToSSB>>["page"]
) {
  await visitRegPage(page);

  const url = `https://reg.oci.fhda.edu/StudentRegistrationSsb/ssb/classRegistration/addRegistrationItem?term=${context.termId}&courseReferenceNumber=${crn}&olr=false`;

  const res: AddCourse = await page.evaluate(async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "user-agent": navigator.userAgent,
      },
      credentials: "include",
    });

    if (!response.ok) return null;

    return await response.json();
  }, url);

  if (!res || !res.success) console.error("failed to add course");

  const model = res.model;
  model.selectedAction = "WL";

  return model;
}

export async function sendBatch(
  models: Model[],
  page: Awaited<ReturnType<typeof loginToSSB>>["page"]
) {
  const url =
    "https://reg.oci.fhda.edu/StudentRegistrationSsb/ssb/classRegistration/submitRegistration/batch";

  const body = JSON.stringify({
    update: models,
    uniqueSessionId: context.uniqueSessionId,
  });

  const response = await page.evaluate(
    async (url, body) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body,
        credentials: "include",
      });

      if (!res.ok) return null;
      return await res.json();
    },
    url,
    body
  );

  if (!response || !response.data?.update) {
    throw new Error("failed to submit registration batch");
  }

  for (const update of response.data.update) {
    const {
      courseReferenceNumber,
      subject,
      courseNumber,
      courseTitle,
      statusDescription,
    } = update;

    if (statusDescription === "Registered") {
      console.log(
        `[${courseReferenceNumber}] Registered: ${subject} ${courseNumber} - ${courseTitle}`
      );
    } else if (statusDescription === "Waitlisted") {
      console.log(
        `[${courseReferenceNumber}] Waitlisted: ${subject} ${courseNumber} - ${courseTitle}`
      );
    } else if (statusDescription === "errors preventing registration") {
      console.error(`❌ Error registering ${subject} ${courseNumber}:`);

      for (const err of update.crnErrors || []) {
        console.error(` - ${err.message}`);
      }
    }
  }
}

export async function addCourses(
  page: Awaited<ReturnType<typeof loginToSSB>>["page"]
) {
  const models: Model[] = [];

  for (const crn of context.crns) {
    const model = await addCourse(crn, page);

    if (model) {
      models.push(model);
    }
  }

  if (models.length === 0) {
    throw new Error("unable to add any courses");
  }

  return await sendBatch(models, page);
}

export default async function signup() {
  const { browser, page } = await loginToSSB();

  await checkRegistrationStatus(page);

  await addCourses(page);
  await browser.close();
}
