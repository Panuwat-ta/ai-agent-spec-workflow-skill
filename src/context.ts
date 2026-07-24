/**
 * Project context generator with auto tech-stack detection.
 */
import * as fs from 'fs';
import * as path from 'path';

interface TechStack {
  language: string;
  framework?: string | undefined;
  dependencies?: string[] | undefined;
}

const TECH_SIGNATURES: { file: string; detect: (cwd: string) => TechStack }[] = [
  {
    file: 'package.json',
    detect: (cwd) => {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        const deps = Object.keys(allDeps || {});
        const framework = deps.includes('next') ? 'Next.js'
          : deps.includes('nuxt') ? 'Nuxt'
          : deps.includes('express') ? 'Express'
          : deps.includes('fastify') ? 'Fastify'
          : deps.includes('react') ? 'React'
          : deps.includes('vue') ? 'Vue'
          : deps.includes('svelte') ? 'Svelte'
          : deps.includes('@angular/core') ? 'Angular'
          : undefined;
        const hasTS = deps.includes('typescript') || fs.existsSync(path.join(cwd, 'tsconfig.json'));
        return {
          language: hasTS ? 'TypeScript' : 'JavaScript',
          framework,
          dependencies: deps.slice(0, 20), // top 20
        };
      } catch { return { language: 'JavaScript' }; }
    }
  },
  { file: 'tsconfig.json', detect: () => ({ language: 'TypeScript' }) },
  { file: 'Cargo.toml', detect: () => ({ language: 'Rust' }) },
  { file: 'go.mod', detect: () => ({ language: 'Go' }) },
  { file: 'pom.xml', detect: () => ({ language: 'Java (Maven)' }) },
  { file: 'build.gradle', detect: () => ({ language: 'Java/Kotlin (Gradle)' }) },
  { file: 'requirements.txt', detect: () => ({ language: 'Python' }) },
  { file: 'pyproject.toml', detect: () => ({ language: 'Python' }) },
  { file: 'Gemfile', detect: () => ({ language: 'Ruby' }) },
  { file: 'composer.json', detect: () => ({ language: 'PHP' }) },
  { file: 'Program.cs', detect: () => ({ language: 'C# (.NET)' }) },
  { file: 'pubspec.yaml', detect: () => ({ language: 'Dart (Flutter)' }) },
];

export function detectTechStack(cwd: string): TechStack | null {
  for (const sig of TECH_SIGNATURES) {
    if (fs.existsSync(path.join(cwd, sig.file))) {
      return sig.detect(cwd);
    }
  }
  return null;
}

function getIgnores(cwd: string): string[] {
  const ignores = ['.git', 'node_modules', 'dist', 'build', 'coverage', '.specs', '.idea', '.vscode', '__pycache__', '.next', 'target'];
  
  // Read .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const parsed = gitignore.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.replace(/\/$/, '')); // remove trailing slashes for simple matching
    ignores.push(...parsed);
  }

  // Read .agentignore
  const agentignorePath = path.join(cwd, '.agentignore');
  if (fs.existsSync(agentignorePath)) {
    const agentignore = fs.readFileSync(agentignorePath, 'utf8');
    const parsed = agentignore.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.replace(/\/$/, ''));
    ignores.push(...parsed);
  }

  return [...new Set(ignores)];
}

export function scanDirectory(dir: string, prefix: string = '', depth: number = 0, maxDepth: number = 5, ignores?: string[]): string {
  if (depth > maxDepth) return '';
  let output = '';

  if (!ignores) {
    ignores = getIgnores(dir); // Initialize ignores at root
  }

  let items: string[] = [];
  try {
    items = fs.readdirSync(dir);
  } catch (e) {
    return '';
  }

  items = items.filter(item => !ignores!.includes(item) && !item.startsWith('.'));

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const isLast = index === items.length - 1;
    const marker = isLast ? '└── ' : '├── ';

    let isDir = false;
    try {
      isDir = fs.statSync(fullPath).isDirectory();
    } catch (e) {
      return;
    }

    output += `${prefix}${marker}${item}\n`;

    if (isDir) {
      output += scanDirectory(fullPath, prefix + (isLast ? '    ' : '│   '), depth + 1, maxDepth, ignores);
    }
  });

  return output;
}

export function generateProjectContext(cwd: string): string {
  const tree = scanDirectory(cwd);
  const tech = detectTechStack(cwd);

  let content = `# Project Context\n\n`;
  content += `**Project Name**: ${path.basename(cwd)}\n`;

  if (tech) {
    content += `**Language**: ${tech.language}\n`;
    if (tech.framework) {
      content += `**Framework**: ${tech.framework}\n`;
    }
    if (tech.dependencies && tech.dependencies.length > 0) {
      content += `**Key Dependencies**: ${tech.dependencies.join(', ')}\n`;
    }
  }

  content += `\n## Directory Structure\n\n\`\`\`\n${path.basename(cwd)}/\n${tree}\`\`\`\n`;

  return content;
}
