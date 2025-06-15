import { genSessionId } from "./src/utils";

export const context: Context = {
  termId: "123456",
  uniqueSessionId: genSessionId(),
  crns: process.env.CRNS!.split(","),
  waitlistTask: false,
};
