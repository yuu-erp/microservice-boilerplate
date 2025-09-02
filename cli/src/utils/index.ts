import path from "path";

export const handlePath = (
  filePath: string,
  baseUrl: string = path.resolve(process.cwd(), "./src"),
) => path.join(baseUrl, filePath);
