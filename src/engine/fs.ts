import * as fs from 'fs';
import * as path from 'path';

export interface FileSystem {
  exists(path: string): boolean;
  readFile(path: string): string;
  writeFile(path: string, data: string): void;
  mkdir(path: string): void;
}

export const defaultFS: FileSystem = {
  exists: (p: string) => fs.existsSync(p),
  readFile: (p: string) => fs.readFileSync(p, 'utf8'),
  writeFile: (p: string, data: string) => {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, data, 'utf8');
  },
  mkdir: (p: string) => {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
  }
};
