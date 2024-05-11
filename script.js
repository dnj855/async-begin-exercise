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

const deleteEntry = async (date) => {
  const filePath = path.join(journalDir, `${date}.txt`);
  try {
    const existingContent = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.log("Erreur, ce fichier n'existe pas.");
    return;
  }
  const confirmation = prompt(
    `Voulez-vous vraiment supprimer l'entrée ${date} ? (O/N) `
  );
  if ((await confirmation).toLowerCase() === "o") {
    await fs.unlink(filePath);
    console.log("L'entrée a bien été supprimée.");
  } else {
    console.log("L'entrée n'a pas été supprimée.");
  }
};

const searchEntry = async (content) => {
  if (!content) {
    content = await prompt("Merci de taper le contenu que vous recherchez : ");
  }
  const files = await fs.readdir(journalDir);
  const searchPromises = files.map((file) => {
    const filePath = path.join(journalDir, file);
    return fs.readFile(filePath, "utf-8").then((fileContent) => {
      if (fileContent.includes(content)) {
        return path.basename(file);
      }
      return null;
    });
  });
  const results = await Promise.all(searchPromises);
  console.log(
    `Le terme "${content}" se trouve dans les fichiers suivants:\n- ` +
      results.filter((result) => result !== null).join("\n- ")
  );
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
    case "delete":
      await deleteEntry(args[1]);
      break;
    case "search":
      await searchEntry(args[1]);
      break;
    default:
      console.log(`
Usage:
- Pour lister les entrées : node script.js list
- Pour ajouter une entrée : node script.js add <date> <content>
- Pour supprimer une entrée : node script.js delete <date>
- Pour rechercher une entrée : node script.js search <content>
`);
      break;
  }
};

main();
