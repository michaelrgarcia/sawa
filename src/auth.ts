import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function loginToSSB() {
  console.log("starting...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  console.log("logging in...");

  await page.goto(
    "https://reg.oci.fhda.edu/StudentRegistrationSsb/saml/login",
    {
      waitUntil: "networkidle2",
    }
  );

  await page.waitForSelector('input[name="j_username"]', { timeout: 10000 });

  await page.type('input[name="j_username"]', process.env.USERNAME!);
  await page.type('input[name="j_password"]', process.env.PASSWORD!);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click("#btn-eventId-proceed"),
  ]);

  await page.goto(
    "https://reg.oci.fhda.edu/StudentRegistrationSsb/ssb/classRegistration/classRegistration"
  );

  console.log("successfully logged in");

  return { browser, page };
}
