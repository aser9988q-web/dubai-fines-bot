import { getPlateCodeOptions, PLATE_SOURCES } from "../server/scraper";

async function main() {
  const summary: Array<{ source: string; count: number; sample: string[] }> = [];

  for (const source of PLATE_SOURCES) {
    const options = await getPlateCodeOptions(source.value);
    summary.push({
      source: source.value,
      count: options.length,
      sample: options.slice(0, 8).map((option) => `${option.labelEn}:${option.codeId}/${option.categoryId}`),
    });
  }

  const emptySources = summary.filter((item) => item.count === 0).map((item) => item.source);
  console.log(JSON.stringify({ summary, emptySources }, null, 2));

  if (emptySources.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
