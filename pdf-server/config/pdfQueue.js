import PQueue from "p-queue";

export const pdfQueue = new PQueue({
  concurrency: 1
});

export default pdfQueue;