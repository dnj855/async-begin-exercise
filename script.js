import fs from "fs/promises";
import path from "path";
import { prompt } from "./helper.js";

const journalDir = path.join(process.cwd(), "journal");

const ensureJournalDirExists = async () => {
  try {
    await fs.access(journalDir);
  } catch (error) {
    await fs.mkdir(journalDir);
  }
};

const listEntries = async () => {
  const files = await fs.readdir(journalDir);
  console.log(files.map((file) => path.basename(file, ".txt")).join("\n"));
};

const addEntry = async (date, content) => {
  if (date === "today") {
    date = new Date().toISOString().slice(0, 10);
  }
  const filePath = path.join(journalDir, `${date}.txt`);
  try {
    const existingContent = await fs.readFile(filePath, "utf-8");
    content = `${existingContent}\n${content}`;
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    await fs.writeFile(filePath, content, "utf-8");
  }
};

const main = async () => {
  await ensureJournalDirExists();
  const args = process.argv.slice(2);
  switch (args[0]) {
    case "list":
      await listEntries();
      break;
    case "add":
      await addEntry(args[1], args.slice(2).join(" "));
      break;
    default:
      console.log(`
Usage:
- Pour lister les entrées : node journal.js list
- Pour ajouter une entrée : node journal.js add <date> <content>
`);
      break;
  }
};

main();
