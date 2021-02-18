import glob from "glob";
import { promises as fs } from "fs";
import { promisify } from "util";
import child_process from "child_process";

const filenames = await promisify(glob)("src/**/*.res");

const incorrectFilenames = (
  await Promise.all(
    filenames.map(async (filename) => {
      const [original, { stdout: formatted }] = await Promise.all([
        fs.readFile(filename, { encoding: "utf8" }),
        promisify(child_process.execFile)("yarn", [
          "run",
          "--silent",
          "bsc",
          "-format",
          filename,
        ]),
      ]);

      return original === formatted ? null : filename;
    })
  )
).filter((filename) => filename != null);

if (incorrectFilenames.length > 0) {
  console.log("The following filenames have not been formatted:");
  for (const incorrectFilename of incorrectFilenames) {
    console.log(incorrectFilename);
  }
  process.exit(0);
}
