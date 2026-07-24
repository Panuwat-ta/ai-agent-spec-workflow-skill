import { FileSystem, defaultFS } from '../engine/fs';
import * as path from 'path';

export function loadTemplate(
  templateName: string,
  customTemplatePath?: string,
  fs: FileSystem = defaultFS
): string {
  if (customTemplatePath && fs.exists(customTemplatePath)) {
    return fs.readFile(customTemplatePath);
  }
  
  const defaultPath = path.join(__dirname, `${templateName}.template.md`);
  if (fs.exists(defaultPath)) {
    return fs.readFile(defaultPath);
  }
  
  throw new Error(`Template not found: ${templateName}`);
}

export function renderTemplate(template: string, data: any): string {
  let result = template;

  // Render {{#each array}}...{{/each}}
  const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  result = result.replace(eachRegex, (match, arrayName, content) => {
    const array = resolvePath(data, arrayName.trim());
    if (!Array.isArray(array)) return '';
    return array.map((item: any) => renderTemplate(content, item)).join('');
  });

  // Render {{#if condition}}...{{/if}}
  const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (match, condition, content) => {
    const val = resolvePath(data, condition.trim());
    return val ? renderTemplate(content, data) : '';
  });

  // Render variables {{variable}}
  const varRegex = /\{\{([^#\/][^}]*)\}\}/g;
  result = result.replace(varRegex, (match, varName) => {
    const val = resolvePath(data, varName.trim());
    if (val === undefined || val === null) {
      // If we're inside an each block and referencing 'this' or '.'
      if (varName.trim() === 'this' || varName.trim() === '.') {
          return typeof data === 'object' ? JSON.stringify(data) : String(data);
      }
      return '';
    }
    return String(val);
  });

  return result;
}

function resolvePath(obj: any, path: string): any {
  if (path === 'this' || path === '.') return obj;
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}
