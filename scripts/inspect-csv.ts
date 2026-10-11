import fs from "fs";
import path from "path";

function parseCSV(content: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      currentCell = "";
      if (currentRow.length > 0 && currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

const csvPath = path.resolve(process.cwd(), "results_58732339_0a67c5bf-ce80-4981-9edc-4cb7c2d38e5a.csv");
const rows = parseCSV(fs.readFileSync(csvPath, "utf-8"));
const headers = rows[0];
const dataRows = rows.slice(1);
const productsMap = new Map<string, any[]>();

for (const r of dataRows) {
  const rowObj: Record<string, string> = {};
  headers.forEach((h, idx) => {
    rowObj[h] = r[idx] || "";
  });
  const prodId = rowObj["Product ID"];
  if (!productsMap.has(prodId)) {
    productsMap.set(prodId, []);
  }
  productsMap.get(prodId)!.push(rowObj);
}

for (const [prodId, group] of productsMap.entries()) {
  const first = group[0];
  console.log(`[ID ${prodId}]`);
  console.log(`  Raw Name: ${first["Product Name*"]}`);
  console.log(`  SEO Title: ${first["Title Tag - Dukaan SEO"]}`);
  console.log(`  Meta Desc: ${first["Meta Description"]?.slice(0, 80)}...`);
  console.log(`  Price: ₹${first["Discounted Price"]} / ₹${first["Price*"]}`);
  console.log(`  Category: ${first["Categories*"]}`);
  console.log("-----------------------------------------");
}
