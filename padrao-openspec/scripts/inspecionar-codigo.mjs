#!/usr/bin/env node

// Read-only inspection of an existing code repository, for /opsx:init in adoption mode (ADR-0010).
// It reads only files tracked by Git, never runs the project's code, tests or package managers, never
// touches the network and never writes to the repository. The output answers what it can of the init
// interview, with confidence and evidence, and never carries secret values or personal data.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const maxFiles = 20000;
const maxBytes = 1024 * 1024;
const maxEvidence = 5;
const maxSnippet = 120;
const skippedSegments = new Set(['vendor', 'dist', 'build', 'out', 'target', 'bin', 'obj', 'coverage', '.next', 'node_modules']);
const levels = { baixa: 1, media: 2, alta: 3 };
// Questions whose answer is a list; every other question has one answer.
const multiple = new Set(['1.7', '2.6', '4.3', '5.3', '6.4', '6.5']);
// Answered only by reading the code, or only partly by this script: the agent reads them.
const readingOnly = ['1.3', '2.3', '6.5', '7.4'];
const readingPartly = ['1.2', '1.5', '1.6', '2.1', '2.4'];

function usage() {
  console.log(`Uso: node docs/openspec-inspecionar-codigo.mjs [--raiz <pasta>] [--json <arquivo>] [--escopo <caminho>[,<caminho>]]

Inspeciona, só lendo, os arquivos rastreados pelo Git e responde o que puder da entrevista do /opsx:init,
com confiança e evidência. Não executa nada do projeto, não usa a rede e não escreve no repositório.`);
}

function parseArgs(args) {
  const options = { raiz: process.cwd(), json: null, escopo: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = () => {
      const next = args[index + 1];
      if (next === undefined || next.startsWith('--')) throw new UsageError(`${arg} precisa de um valor.`);
      index += 1;
      return next;
    };
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--raiz') options.raiz = value();
    else if (arg === '--json') options.json = value();
    else if (arg === '--escopo') options.escopo = value().split(',').map((item) => item.trim().replace(/\\/g, '/').replace(/^\.\/|\/+$/g, '')).filter(Boolean);
    else throw new UsageError(`Opção desconhecida: ${arg}`);
  }
  return options;
}

class UsageError extends Error {}

// Git is the only program this script runs, always with fixed arguments and without a shell.
function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Files

function managedPaths(root) {
  const manifest = path.join(root, '.openspec-padrao.json');
  const managed = new Set(['.openspec-padrao.json', 'openspec/config.yaml', 'openspec/config.yml']);
  if (!existsSync(manifest)) return managed;
  try {
    const data = JSON.parse(readFileSync(manifest, 'utf8'));
    for (const file of [...(data.managedFiles ?? []), ...(data.managedBlocks ?? [])]) managed.add(file);
  } catch {
    // An unreadable manifest only means nothing else is skipped.
  }
  return managed;
}

function isGlobal(file) {
  return !file.includes('/') || file.startsWith('.github/');
}

function listFiles(root, scope) {
  const out = git(root, ['ls-files', '-z']);
  if (out === null) throw new UsageError(`${root} não é um repositório Git (git ls-files falhou).`);
  const managed = managedPaths(root);
  const files = out.split('\0').filter(Boolean)
    .filter((file) => !managed.has(file))
    .filter((file) => !file.split('/').some((segment) => skippedSegments.has(segment)))
    .filter((file) => !/\.min\.(js|css)$/i.test(file))
    .filter((file) => scope.length === 0 || isGlobal(file) || scope.some((dir) => file === dir || file.startsWith(`${dir}/`)))
    .sort();
  return { files: files.slice(0, maxFiles), beyondLimit: Math.max(0, files.length - maxFiles) };
}

function readTexts(root, files) {
  const texts = new Map();
  let large = 0;
  for (const file of files) {
    let buffer;
    try {
      buffer = readFileSync(path.join(root, file));
    } catch {
      continue;
    }
    if (buffer.length > maxBytes) {
      large += 1;
      continue;
    }
    if (buffer.subarray(0, 8192).includes(0)) continue;
    // Line endings normalized, so line numbers are the same on Windows and Linux.
    texts.set(file, buffer.toString('utf8').replace(/\r\n?/g, '\n').split('\n'));
  }
  return { texts, large };
}

// ---------------------------------------------------------------------------------------------
// Privacy

const envFile = /(^|\/)\.env(\.[^/]*)?$/i;
const envSample = /(^|\/)\.env\.(example|sample|template)$/i;

function isDataFile(file, lines) {
  if (/(^|\/)seed[^/]*$/i.test(file) || /\.csv$/i.test(file) || /(^|\/)(fixtures|testdata)\//i.test(file)) return true;
  return /\.sql$/i.test(file) && (lines ?? []).some((line) => /\binsert\s+into\b/i.test(line));
}

// Values that look secret become ***; the result is cut to 120 characters.
function mask(line) {
  return line.trim()
    .replace(/(\/\/)[^\s/@:]+:[^\s/@]+@/g, '$1***@')
    .replace(/((?:key|secret|token|password|passwd|pwd|credential|connection|dsn)[\w-]*["']?\s*[:=]\s*["']?)([^\s"',;]+)/gi, '$1***')
    .replace(/(?=[A-Za-z0-9+/=_-]*\d)[A-Za-z0-9+/=_-]{32,}/g, '***')
    .slice(0, maxSnippet);
}

function evidence(ctx, file, index) {
  const lines = ctx.texts.get(file);
  const item = { arquivo: file, linha: index + 1 };
  if (lines && !isDataFile(file, lines)) item.trecho = mask(lines[index] ?? '');
  return item;
}

function fileEvidence(file) {
  return { arquivo: file };
}

// ---------------------------------------------------------------------------------------------
// Manifests and usage

function lineOf(lines, pattern) {
  const index = lines.findIndex((line) => pattern.test(line));
  return index < 0 ? 0 : index;
}

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseManifests(ctx) {
  const deps = [];
  const projects = [];
  const scripts = [];
  for (const [file, lines] of ctx.texts) {
    const base = path.posix.basename(file);
    const dir = path.posix.dirname(file) === '.' ? '' : path.posix.dirname(file);
    if (base === 'package.json') {
      let data;
      try {
        data = JSON.parse(lines.join('\n'));
      } catch {
        continue;
      }
      const names = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
        .flatMap((key) => Object.keys(data[key] ?? {}));
      for (const name of names) deps.push({ eco: 'js', name, file, line: lineOf(lines, new RegExp(`"${escapeRe(name)}"\\s*:`)) });
      for (const [name, command] of Object.entries(data.scripts ?? {})) {
        scripts.push({ file, dir, name, command, line: lineOf(lines, new RegExp(`"${escapeRe(name)}"\\s*:`)) });
      }
      projects.push({ caminho: dir || '.', manifest: file, eco: 'js', nome: typeof data.name === 'string' ? data.name : null });
    } else if (/\.csproj$/i.test(base)) {
      const text = lines.join('\n');
      const sdk = text.match(/<Project\s+Sdk="([^"]+)"/i)?.[1];
      if (sdk) deps.push({ eco: 'cs', name: `sdk:${sdk}`, file, line: lineOf(lines, /<Project\s+Sdk=/i) });
      lines.forEach((line, index) => {
        const match = line.match(/<PackageReference\s+Include="([^"]+)"/i);
        if (match) deps.push({ eco: 'cs', name: match[1], file, line: index });
      });
      projects.push({ caminho: dir || '.', manifest: file, eco: 'cs', nome: base.replace(/\.csproj$/i, '') });
    } else if (/^requirements[^/]*\.txt$/i.test(base) || base === 'pyproject.toml') {
      lines.forEach((line, index) => {
        const match = base === 'pyproject.toml'
          ? line.match(/^\s*["']([A-Za-z0-9_.-]+)/)
          : line.match(/^\s*([A-Za-z0-9_.-]+)\s*(?:\[[^\]]*\])?\s*(?:[<>=~!;]|$)/);
        if (match && !line.trim().startsWith('#')) deps.push({ eco: 'py', name: match[1].toLowerCase(), file, line: index });
      });
      projects.push({ caminho: dir || '.', manifest: file, eco: 'py', nome: null });
    } else if (base === 'pom.xml' || /^build\.gradle(\.kts)?$/.test(base)) {
      lines.forEach((line, index) => {
        const match = line.match(/<artifactId>([^<]+)<\/artifactId>/) ?? line.match(/["'][\w.-]+:([\w.-]+)(?::[^"']*)?["']/);
        if (match) deps.push({ eco: 'java', name: match[1], file, line: index });
      });
      projects.push({ caminho: dir || '.', manifest: file, eco: 'java', nome: null });
    } else if (base === 'go.mod') {
      lines.forEach((line, index) => {
        const match = line.match(/^\s*(?:require\s+)?([a-z0-9.-]+\.[a-z]+\/[^\s]+)\s+v/);
        if (match) deps.push({ eco: 'go', name: match[1], file, line: index });
      });
      projects.push({ caminho: dir || '.', manifest: file, eco: 'go', nome: null });
    }
  }
  return { deps, projects, scripts };
}

function collectImports(ctx) {
  const imports = new Map();
  const add = (name, file, index) => {
    if (!imports.has(name)) imports.set(name, []);
    imports.get(name).push({ file, index });
  };
  for (const [file, lines] of ctx.texts) {
    if (isDataFile(file, lines)) continue;
    lines.forEach((line, index) => {
      if (/\.(m?[jt]sx?|cjs)$/i.test(file)) {
        for (const match of line.matchAll(/(?:from\s+|require\(\s*|import\(\s*|^\s*import\s+)['"]([^'"./][^'"]*)['"]/g)) {
          const spec = match[1];
          add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0], file, index);
        }
      } else if (/\.py$/i.test(file)) {
        const match = line.match(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/);
        if (match) add((match[1] ?? match[2]).split('.')[0].toLowerCase(), file, index);
      } else if (/\.cs$/i.test(file)) {
        const match = line.match(/^\s*using\s+([\w.]+)\s*;/);
        if (match) add(match[1], file, index);
      } else if (/\.go$/i.test(file)) {
        for (const match of line.matchAll(/"([a-z0-9.-]+\.[a-z]+\/[^"]+)"/g)) add(match[1], file, index);
      } else if (/\.(java|kt)$/i.test(file)) {
        const match = line.match(/^\s*import\s+([\w.]+)/);
        if (match) add(match[1], file, index);
      }
    });
  }
  return imports;
}

// ---------------------------------------------------------------------------------------------
// Catalog (ADR-0010, design D4). Each rule maps a signal to an init question and option.
//   deps: dependency names (js/py lower case as declared); prefix match when the name ends with '*'
//   use: how a declared dependency counts as used (default: an import of the same package, or a
//        package.json script that calls it); a RegExp over code lines; or 'decl' for declared is enough
//   files / content: file path pattern, optionally with a content pattern, at a fixed level

const r = (q, v, rotulo, spec) => ({ q, v, rotulo, ...spec });

const catalog = [
  // Block 1
  r('1.7', '1', 'Português (pt-BR)', { files: /(^|\/)(locales|i18n|messages)\/pt[-_]?br(\/|\.json$)/i, nivel: 'alta' }),
  r('1.7', '2', 'Inglês (en-US)', { files: /(^|\/)(locales|i18n|messages)\/en([-_]us)?(\/|\.json$)/i, nivel: 'alta' }),
  r('1.7', '3', 'Espanhol (es)', { files: /(^|\/)(locales|i18n|messages)\/es(\/|\.json$)/i, nivel: 'alta' }),
  r('1.8', '2', 'Funcionalidades básicas offline (PWA)', { deps: ['next-pwa', 'workbox-*', 'vite-plugin-pwa'], max: 'media' }),
  r('1.8', '2', 'Funcionalidades básicas offline (PWA)', { files: /(^|\/)(manifest\.webmanifest|service-worker\.[jt]s|sw\.[jt]s)$/i, nivel: 'media' }),
  r('1.8', '4', 'Aplicativo nativo', { deps: ['react-native', 'expo'], use: 'decl' }),
  r('1.8', '4', 'Aplicativo nativo', { files: /(^|\/)pubspec\.yaml$/i, nivel: 'alta' }),
  // Block 2
  r('2.5', '2', 'Jobs agendados (cron)', { deps: ['node-cron', 'agenda', 'Hangfire', 'Quartz', 'django-celery-beat'] }),
  r('2.5', '3', 'Filas de tarefas assíncronas', { deps: ['bullmq', 'pg-boss', 'rq', 'celery', 'bull'] }),
  r('2.6', '1', 'API HTTP com contrato OpenAPI', { files: /(^|\/)(openapi|swagger)\.(ya?ml|json)$/i, nivel: 'alta', contrato: 'openapi' }),
  r('2.6', '2', 'API GraphQL com contrato SDL', { files: /\.(graphql|gql)$/i, nivel: 'alta', contrato: 'graphql' }),
  r('2.6', '3', 'gRPC com Protocol Buffers', { files: /\.proto$/i, nivel: 'alta', contrato: 'protobuf' }),
  r('2.6', '4', 'Eventos com contrato AsyncAPI', { files: /(^|\/)asyncapi\.(ya?ml|json)$/i, nivel: 'alta', contrato: 'asyncapi' }),
  // Block 3
  r('3.1', '1', 'TypeScript + Node.js', { deps: ['express', 'fastify', 'hono', '@nestjs/core', 'koa'] }),
  r('3.1', '2', 'C# + .NET', { deps: ['sdk:Microsoft.NET.Sdk.Web'], use: /\bWebApplication\.|\bWebHost\b/ }),
  r('3.1', '3', 'Python', { deps: ['django', 'fastapi', 'flask'] }),
  r('3.1', '4', 'Java / Kotlin (Spring Boot)', { deps: ['spring-boot-starter-web', 'spring-boot-starter*'] }),
  r('3.1', '5', 'Go', { deps: ['github.com/gin-gonic/gin', 'github.com/labstack/echo*', 'github.com/gofiber/fiber*'] }),
  r('3.2', '1', 'Next.js', { deps: ['next'] }),
  r('3.2', '2', 'SPA em JavaScript/TypeScript', { deps: ['vite', '@angular/core', 'nuxt', '@vue/cli-service'] }),
  r('3.2', '4', 'Blazor', { deps: ['Microsoft.AspNetCore.Components.WebAssembly', 'sdk:Microsoft.NET.Sdk.BlazorWebAssembly'], use: 'decl' }),
  r('3.2', '5', 'Aplicativo móvel ou desktop', { deps: ['react-native', 'expo'], use: 'decl' }),
  r('3.3', '1', 'PostgreSQL', { deps: ['pg', 'postgres', 'Npgsql', 'Npgsql.EntityFrameworkCore.PostgreSQL', 'psycopg', 'psycopg2', 'psycopg2-binary', 'asyncpg', 'org.postgresql'] }),
  r('3.3', '1', 'PostgreSQL', { files: /(^|\/)schema\.prisma$/, content: /provider\s*=\s*"postgresql"/, nivel: 'alta' }),
  r('3.3', '1', 'PostgreSQL', { files: /(^|\/)(docker-)?compose[^/]*\.ya?ml$/i, content: /image:\s*["']?postgres(:|["'\s]|$)/i, nivel: 'alta' }),
  r('3.3', '1', 'PostgreSQL', { files: /\.py$/, content: /django\.db\.backends\.postgresql/, nivel: 'alta' }),
  r('3.3', '2', 'MySQL / MariaDB', { deps: ['mysql2', 'mysql', 'Pomelo.EntityFrameworkCore.MySql', 'mysqlclient', 'pymysql'] }),
  r('3.3', '2', 'MySQL / MariaDB', { files: /(^|\/)(docker-)?compose[^/]*\.ya?ml$/i, content: /image:\s*["']?(mysql|mariadb)(:|["'\s]|$)/i, nivel: 'alta' }),
  r('3.3', '3', 'SQL Server', { deps: ['Microsoft.EntityFrameworkCore.SqlServer', 'mssql', 'pyodbc'], use: /\bUseSqlServer\(|require\(['"]mssql['"]\)|from ['"]mssql['"]|import pyodbc/ }),
  r('3.3', '3', 'SQL Server', { files: /(^|\/)(docker-)?compose[^/]*\.ya?ml$/i, content: /image:\s*["']?mcr\.microsoft\.com\/mssql/i, nivel: 'alta' }),
  r('3.3', '4', 'SQLite', { deps: ['better-sqlite3', 'sqlite3', 'Microsoft.EntityFrameworkCore.Sqlite'] }),
  r('3.3', '5', 'MongoDB', { deps: ['mongodb', 'mongoose', 'pymongo', 'MongoDB.Driver'] }),
  r('3.4', '2', 'Self-hosted em contêiner', { files: /(^|\/)(docker-)?compose[^/]*\.ya?ml$/i, content: /image:\s*["']?(postgres|mysql|mariadb|mongo|mcr\.microsoft\.com\/mssql)/i, nivel: 'media' }),
  r('3.5', '1', 'Prisma / Drizzle', { deps: ['@prisma/client', 'prisma', 'drizzle-orm'] }),
  r('3.5', '2', 'Entity Framework Core / Dapper', { deps: ['Microsoft.EntityFrameworkCore*', 'Dapper'], use: /\busing Microsoft\.EntityFrameworkCore\b|\bUseSqlServer\(|\bUseNpgsql\(|\busing Dapper\b/ }),
  r('3.5', '3', 'ORM do próprio framework', { deps: ['django'] }),
  r('3.5', '4', 'SQLAlchemy', { deps: ['sqlalchemy'] }),
  r('3.5', '5', 'JPA / Hibernate', { deps: ['spring-boot-starter-data-jpa', 'hibernate-core'] }),
  r('3.6', '1', 'JWT Bearer', { deps: ['jsonwebtoken', 'passport-jwt', 'Microsoft.AspNetCore.Authentication.JwtBearer', 'pyjwt'] }),
  r('3.6', '2', 'Sessão + cookie', { deps: ['express-session'] }),
  r('3.6', '3', 'OAuth2 / OpenID Connect', { deps: ['openid-client', 'Microsoft.Identity.Web', 'spring-boot-starter-oauth2-*'] }),
  r('3.6', '4', 'Auth.js / NextAuth', { deps: ['next-auth', '@auth/*'] }),
  r('3.6', '5', 'Serviço gerenciado', { deps: ['@clerk/*', 'auth0', '@auth0/*', '@supabase/auth-*', 'firebase-admin'] }),
  r('3.7', '1', 'Zod / Valibot', { deps: ['zod', 'valibot'] }),
  r('3.7', '2', 'FluentValidation / Data Annotations', { deps: ['FluentValidation*'], use: /\busing FluentValidation\b/ }),
  r('3.7', '3', 'Pydantic', { deps: ['pydantic'] }),
  r('3.7', '4', 'Bean Validation', { deps: ['spring-boot-starter-validation', 'jakarta.validation-api'] }),
  r('3.8', '1', 'Fila no próprio banco', { deps: ['pg-boss', 'Hangfire*'] }),
  r('3.8', '2', 'Fila em Redis', { deps: ['bullmq', 'bull', 'rq', 'celery'] }),
  r('3.8', '3', 'Broker dedicado', { deps: ['amqplib', 'kafkajs', 'MassTransit*', 'Azure.Messaging.ServiceBus'] }),
  r('3.8', '5', 'Serviço gerenciado', { deps: ['inngest', '@trigger.dev/*'] }),
  r('3.9', '1', 'Resend', { deps: ['resend'] }),
  r('3.9', '2', 'SendGrid', { deps: ['@sendgrid/mail'] }),
  r('3.9', '3', 'Amazon SES', { deps: ['@aws-sdk/client-ses'] }),
  r('3.9', '4', 'SMTP próprio / Nodemailer', { deps: ['nodemailer'] }),
  r('3.9', '5', 'Mailgun', { deps: ['mailgun.js', 'mailgun-js'] }),
  r('3.10', '1', 'Amazon S3', { deps: ['@aws-sdk/client-s3', 'boto3'] }),
  r('3.10', '2', 'Azure Blob Storage', { deps: ['@azure/storage-blob', 'Azure.Storage.Blobs'] }),
  r('3.10', '3', 'Google Cloud Storage', { deps: ['@google-cloud/storage'] }),
  // Block 4
  r('4.1', '1', 'Vercel / Netlify', { files: /^(vercel\.json|netlify\.toml)$/, nivel: 'media' }),
  r('4.1', '4', 'Google Cloud', { files: /^app\.yaml$/, nivel: 'media' }),
  r('4.1', '6', 'Fly.io / Render / Heroku', { files: /^(fly\.toml|render\.yaml|Procfile)$/, nivel: 'media' }),
  r('4.4', '1', '.env local + cofre em produção', { deps: ['@aws-sdk/client-secrets-manager', '@azure/keyvault-secrets', 'Azure.Security.KeyVault.Secrets'], max: 'media' }),
  r('4.4', '3', 'HashiCorp Vault', { deps: ['node-vault', 'hvac', 'VaultSharp'], max: 'media' }),
  r('4.4', '4', 'Doppler', { files: /(^|\/)doppler\.ya?ml$/, nivel: 'media' }),
  r('4.5', '1', 'Cloudflare', { files: /(^|\/)wrangler\.toml$/, nivel: 'media' }),
  r('4.5', '3', 'Vercel Edge Network', { files: /^vercel\.json$/, nivel: 'media' }),
  // Block 5
  r('5.2', '1', 'GitHub Actions', { files: /^\.github\/workflows\/[^/]+\.ya?ml$/, nivel: 'alta' }),
  r('5.2', '2', 'GitLab CI', { files: /^\.gitlab-ci\.ya?ml$/, nivel: 'alta' }),
  r('5.2', '3', 'Azure DevOps Pipelines', { files: /^azure-pipelines\.ya?ml$/, nivel: 'alta' }),
  r('5.2', '6', 'Jenkins / CircleCI', { files: /^(Jenkinsfile|\.circleci\/config\.ya?ml)$/, nivel: 'alta' }),
  r('5.4', '1', 'Vitest / Jest', { deps: ['vitest', 'jest'] }),
  r('5.4', '2', 'Pytest', { deps: ['pytest'] }),
  r('5.4', '3', 'xUnit / NUnit', { deps: ['xunit', 'NUnit'], use: /\busing (Xunit|NUnit\.Framework)\b/ }),
  r('5.4', '4', 'JUnit', { deps: ['junit', 'junit-jupiter', 'junit-jupiter-api'] }),
  r('5.4', '5', 'go test', { files: /_test\.go$/, nivel: 'alta' }),
  r('5.5', '1', 'Playwright', { deps: ['@playwright/test', 'Microsoft.Playwright'] }),
  r('5.5', '2', 'Cypress', { deps: ['cypress'] }),
  r('5.5', '3', 'Selenium', { deps: ['selenium-webdriver', 'selenium', 'Selenium.WebDriver'] }),
  r('5.5', '4', 'Puppeteer', { deps: ['puppeteer'] }),
  r('5.5', '5', 'Testcontainers', { deps: ['testcontainers', 'Testcontainers*', 'testcontainers-python'] }),
  // Block 6
  r('6.1', '1', 'Console / stdout', { deps: ['pino', 'winston', 'structlog'] }),
  r('6.1', '1', 'Console / stdout', { deps: ['Serilog.Sinks.Console'], use: /\bWriteTo\.Console\(/ }),
  r('6.2', '1', 'Sentry', { deps: ['@sentry/*', 'sentry-sdk', 'Sentry.AspNetCore'] }),
  r('6.2', '2', 'Datadog APM', { deps: ['dd-trace', 'ddtrace'] }),
  r('6.2', '3', 'Bugsnag', { deps: ['@bugsnag/*', 'bugsnag'] }),
  r('6.2', '4', 'Rollbar', { deps: ['rollbar'] }),
  r('6.3', '1', 'OpenTelemetry', { deps: ['@opentelemetry/*', 'opentelemetry-api', 'OpenTelemetry*'] }),
  r('6.3', '2', 'Datadog APM', { deps: ['dd-trace', 'ddtrace'] }),
  r('6.3', '3', 'AWS X-Ray', { deps: ['aws-xray-sdk', 'aws-xray-sdk-core'] }),
  r('6.3', '4', 'Jaeger', { deps: ['jaeger-client'] }),
  r('6.4', '1', 'Rate limiting', { deps: ['express-rate-limit', '@fastify/rate-limit', 'AspNetCoreRateLimit', 'django-ratelimit'], max: 'media' }),
  r('6.4', '3', 'CSRF protection', { deps: ['csurf', '@fastify/csrf-protection'], max: 'media' }),
  r('6.4', '4', 'Helmet / headers de segurança', { deps: ['helmet', '@fastify/helmet'], max: 'media' }),
  r('6.6', '2', 'Criptografia de campos sensíveis', { files: /\.(sql|prisma)$/i, content: /pgcrypto/i, nivel: 'media' }),
];

function nameMatches(pattern, name) {
  return pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern;
}

// A declared dependency counts as used when the code imports it or a package.json script calls it.
function usageOf(rule, dep, ctx) {
  if (rule.use === 'decl') return [];
  if (rule.use instanceof RegExp) {
    for (const [file, lines] of ctx.texts) {
      if (isDataFile(file, lines) || !/\.(cs|[cm]?[jt]sx?|py|java|kt|go)$/i.test(file)) continue;
      const index = lines.findIndex((line) => rule.use.test(line));
      if (index >= 0) return [evidence(ctx, file, index)];
    }
    return null;
  }
  const hits = ctx.imports.get(dep.name);
  if (hits?.length) return [evidence(ctx, hits[0].file, hits[0].index)];
  const script = ctx.scripts.find((item) => new RegExp(`(^|[\\s;&|])${escapeRe(dep.name)}(\\s|$)`).test(item.command));
  if (script) return [evidence(ctx, script.file, script.line)];
  return null;
}

function applyCatalog(ctx) {
  const found = [];
  for (const rule of catalog) {
    if (rule.deps) {
      for (const dep of ctx.deps) {
        if (!rule.deps.some((pattern) => nameMatches(pattern, dep.name))) continue;
        const used = usageOf(rule, dep, ctx);
        let nivel = used || rule.use === 'decl' ? 'alta' : 'media';
        if (rule.max && levels[nivel] > levels[rule.max]) nivel = rule.max;
        found.push({ q: rule.q, v: rule.v, rotulo: rule.rotulo, nivel, evidencias: [evidence(ctx, dep.file, dep.line), ...(used ?? [])] });
      }
    } else if (rule.files) {
      for (const file of ctx.files) {
        if (!rule.files.test(file)) continue;
        if (rule.content) {
          const lines = ctx.texts.get(file);
          const index = lines ? lines.findIndex((line) => rule.content.test(line)) : -1;
          if (index < 0) continue;
          found.push({ q: rule.q, v: rule.v, rotulo: rule.rotulo, nivel: rule.nivel, evidencias: [evidence(ctx, file, index)] });
        } else {
          found.push({ q: rule.q, v: rule.v, rotulo: rule.rotulo, nivel: rule.nivel, evidencias: [fileEvidence(file)], contrato: rule.contrato, arquivo: file });
        }
      }
    }
  }
  return found;
}

// ---------------------------------------------------------------------------------------------
// Signals that come from structure, not from a single rule

function classifyProjects(ctx) {
  const result = [];
  for (const project of ctx.projects) {
    const own = ctx.deps.filter((dep) => dep.file === project.manifest).map((dep) => dep.name);
    const has = (...names) => own.some((name) => names.some((pattern) => nameMatches(pattern, name)));
    let tipo = null;
    if (has('express', 'fastify', 'hono', '@nestjs/core', 'koa', 'sdk:Microsoft.NET.Sdk.Web', 'django', 'fastapi', 'flask', 'spring-boot-starter-web', 'github.com/gin-gonic/gin', 'github.com/labstack/echo*', 'github.com/gofiber/fiber*')) tipo = 'backend';
    else if (has('next', 'vite', '@angular/core', 'nuxt', 'react-native', 'expo')) tipo = 'frontend';
    if (tipo) result.push({ caminho: project.caminho, tipo, manifest: project.manifest });
  }
  return result.sort((a, b) => a.caminho.localeCompare(b.caminho));
}

function structuralSignals(ctx) {
  const found = [];
  const backend = ctx.projetos.some((project) => project.tipo === 'backend');
  const frontend = ctx.projetos.some((project) => project.tipo === 'frontend');
  const firstManifest = (tipo) => ctx.projetos.find((project) => project.tipo === tipo)?.manifest;

  // 1.1: the name from the main manifest, or the README title.
  const root = ctx.projects.find((project) => project.caminho === '.' && project.nome);
  if (root) {
    const lines = ctx.texts.get(root.manifest);
    found.push({ q: '1.1', v: root.nome, rotulo: root.nome, nivel: 'media', evidencias: [evidence(ctx, root.manifest, lineOf(lines, /"name"\s*:/))] });
  } else if (ctx.texts.has('README.md')) {
    const lines = ctx.texts.get('README.md');
    const index = lines.findIndex((line) => /^#\s+\S/.test(line));
    if (index >= 0) {
      const title = lines[index].replace(/^#\s+/, '').trim();
      found.push({ q: '1.1', v: title, rotulo: title, nivel: 'media', evidencias: [evidence(ctx, 'README.md', index)] });
    }
  }

  // 2.2: what kinds of project live in this one repository.
  if (backend && frontend) found.push({ q: '2.2', v: '1', rotulo: 'Monorepo — front-end e back-end no mesmo repositório', nivel: 'alta', evidencias: [fileEvidence(firstManifest('backend')), fileEvidence(firstManifest('frontend'))] });
  else if (backend) found.push({ q: '2.2', v: '3', rotulo: 'Apenas back-end', nivel: 'alta', evidencias: [fileEvidence(firstManifest('backend'))] });
  else if (frontend) found.push({ q: '2.2', v: '4', rotulo: 'Apenas front-end', nivel: 'alta', evidencias: [fileEvidence(firstManifest('frontend'))] });

  // 3.2 = 0: a back-end with no front-end project of its own.
  if (backend && !frontend) found.push({ q: '3.2', v: '0', rotulo: 'Não há front-end próprio', nivel: 'media', evidencias: [fileEvidence(firstManifest('backend'))] });

  // 4.2: containers in the repository.
  const dockerfile = ctx.files.find((file) => /(^|\/)Dockerfile[^/]*$/.test(file));
  const compose = ctx.files.find((file) => /(^|\/)(docker-)?compose[^/]*\.ya?ml$/i.test(file));
  const kubernetes = ctx.files.find((file) => /(^|\/)(k8s|kubernetes|helm|charts)\//i.test(file) || /(^|\/)Chart\.yaml$/.test(file));
  if (kubernetes) found.push({ q: '4.2', v: '5', rotulo: 'Kubernetes', nivel: 'alta', evidencias: [fileEvidence(kubernetes)] });
  else if (dockerfile && compose) found.push({ q: '4.2', v: '1', rotulo: 'Docker em produção e desenvolvimento', nivel: 'media', evidencias: [fileEvidence(dockerfile), fileEvidence(compose)] });
  else if (dockerfile) found.push({ q: '4.2', v: '2', rotulo: 'Docker apenas em produção', nivel: 'media', evidencias: [fileEvidence(dockerfile)] });
  else if (compose) found.push({ q: '4.2', v: '3', rotulo: 'Docker apenas em desenvolvimento', nivel: 'media', evidencias: [fileEvidence(compose)] });
  else if (backend) found.push({ q: '4.2', v: '4', rotulo: 'Sem contêiner', nivel: 'media', evidencias: [fileEvidence(firstManifest('backend'))] });

  // 4.4 = 5: only an env sample and no secrets vault.
  const sample = ctx.files.find((file) => envSample.test(file));
  const vault = found.some((item) => item.q === '4.4') || ctx.found.some((item) => item.q === '4.4');
  if (sample && !vault) found.push({ q: '4.4', v: '5', rotulo: 'Apenas .env', nivel: 'media', evidencias: [fileEvidence(sample)] });

  // 5.1 and 5.9: branches and people, from the Git history (counts only).
  const branches = ctx.git.branches;
  if (branches.includes('develop') && branches.some((branch) => branch.startsWith('release/'))) {
    found.push({ q: '5.1', v: '3', rotulo: 'Git Flow', nivel: 'media', evidencias: [{ arquivo: 'git: branches develop e release/*' }] });
  } else if (ctx.git.pessoas12Meses === 1 && branches.length === 1) {
    found.push({ q: '5.1', v: '4', rotulo: 'Apenas main', nivel: 'media', evidencias: [{ arquivo: `git: uma branch (${branches[0]}) e uma pessoa` }] });
  }
  const people = ctx.git.pessoas12Meses;
  if (people > 0) {
    const v = people === 1 ? '1' : people <= 3 ? '2' : people <= 10 ? '3' : '4';
    found.push({ q: '5.9', v, rotulo: `${people} pessoa(s) com commits nos últimos 12 meses`, nivel: 'media', evidencias: [{ arquivo: 'git: log dos últimos 12 meses' }] });
  }

  // 5.3: what the CI runs.
  const ciChecks = [];
  for (const step of ctx.ciSteps) {
    if (/\blint\b|eslint|ruff|golangci-lint|dotnet format/.test(step.command)) ciChecks.push({ v: '1', step });
    if (/\btypecheck\b|\btsc\b|\bmypy\b|\bbuild\b/.test(step.command)) ciChecks.push({ v: '2', step });
    if (/\btest\b|\bpytest\b|\bvitest\b|\bjest\b|go test/.test(step.command) && !/e2e|playwright|cypress/i.test(step.command)) ciChecks.push({ v: '3', step });
    if (/e2e|playwright|cypress/i.test(step.command)) ciChecks.push({ v: '5', step });
  }
  for (const check of ciChecks) {
    found.push({ q: '5.3', v: check.v, rotulo: { 1: 'Lint', 2: 'Typecheck/build', 3: 'Testes unitários', 5: 'Testes E2E' }[check.v], nivel: 'alta', evidencias: [evidence(ctx, check.step.file, check.step.line)] });
  }

  // 5.6: a coverage threshold.
  for (const [file, lines] of ctx.texts) {
    const index = lines.findIndex((line) => /coverageThreshold|thresholds\s*:|fail_under|<Threshold>|<minimum>/.test(line));
    if (index < 0 || !/(jest|vitest|vite|setup\.cfg|pyproject|\.coveragerc|csproj|pom\.xml|package\.json)/i.test(file)) continue;
    const value = lines.slice(index, index + 6).join(' ').match(/(\d{2,3})(?:\.\d+)?/)?.[1];
    found.push({ q: '5.6', v: value === '70' ? '2' : '6', rotulo: value ? `Limite de ${value}%` : 'Limite configurado', nivel: 'alta', evidencias: [evidence(ctx, file, index)] });
  }

  // 5.8: the remote host.
  if (ctx.git.remoto) found.push({ q: '5.8', v: ctx.git.remoto.host, rotulo: ctx.git.remoto.host, nivel: 'alta', evidencias: [{ arquivo: 'git: remote origin' }] });

  return found;
}

// ---------------------------------------------------------------------------------------------
// CI steps and verification commands (7.1)

function ciSteps(ctx) {
  const steps = [];
  for (const [file, lines] of ctx.texts) {
    if (!/^(\.github\/workflows\/[^/]+\.ya?ml|\.gitlab-ci\.ya?ml|azure-pipelines\.ya?ml)$/.test(file)) continue;
    // A command is a "run:" or "script:" value, or a list item inside a "script:" block (GitLab CI).
    let scriptIndent = null;
    lines.forEach((line, index) => {
      const indent = line.match(/^\s*/)[0].length;
      const inline = line.match(/^\s*-?\s*(?:run|script):\s*(\S.*)$/);
      if (inline && !/^[|>]/.test(inline[1])) {
        steps.push({ file, line: index, command: inline[1].trim().replace(/^["']|["']$/g, '') });
        scriptIndent = null;
        return;
      }
      if (/^\s*-?\s*script:\s*$/.test(line)) {
        scriptIndent = indent;
        return;
      }
      if (scriptIndent !== null) {
        const item = line.match(/^\s*-\s+(.+)$/);
        if (item && indent >= scriptIndent) steps.push({ file, line: index, command: item[1].trim().replace(/^["']|["']$/g, '') });
        else if (line.trim() && indent <= scriptIndent) scriptIndent = null;
      }
    });
  }
  return steps;
}

const purposes = [
  ['Instalar dependências', /\b(npm (ci|install)|pnpm install|yarn( install)?$|yarn install|pip install|poetry install|uv sync|dotnet restore|go mod download|mvn (dependency|install))\b/],
  ['Lint', /\blint\b|eslint|ruff|golangci-lint|dotnet format|flake8/],
  ['Typecheck/build', /\btypecheck\b|\btsc\b|\bmypy\b|\bbuild\b/],
  ['Testes', /\btest\b|\bpytest\b|\bvitest\b|\bjest\b|go test/],
  ['Migrações', /\bmigrat|\bprisma migrate\b|\balembic upgrade\b|\bdotnet ef\b/],
  ['Auditoria de dependências', /\baudit\b|pip-audit|dotnet list package --vulnerable|govulncheck/],
  ['Varredura de secrets', /gitleaks|trufflehog|detect-secrets/],
];

function packageRunner(ctx) {
  if (ctx.files.some((file) => /(^|\/)(pnpm-lock\.yaml|pnpm-workspace\.yaml)$/.test(file))) return 'pnpm';
  if (ctx.files.some((file) => /(^|\/)yarn\.lock$/.test(file))) return 'yarn';
  return 'npm';
}

function verificationCommands(ctx) {
  const commands = {};
  const add = (purpose, item) => {
    commands[purpose] ??= [];
    if (!commands[purpose].some((existing) => existing.comando === item.comando)) commands[purpose].push(item);
  };
  for (const step of ctx.ciSteps) {
    for (const [purpose, pattern] of purposes) {
      if (pattern.test(step.command) && !(purpose === 'Testes' && /e2e/i.test(step.command))) {
        add(purpose, { comando: step.command, origem: `${step.file}:${step.line + 1}`, nivel: 'alta' });
      }
    }
  }
  const runner = packageRunner(ctx);
  const scriptPurposes = { test: 'Testes', lint: 'Lint', typecheck: 'Typecheck/build', build: 'Typecheck/build', migrate: 'Migrações' };
  for (const script of ctx.scripts) {
    const purpose = scriptPurposes[script.name];
    if (!purpose) continue;
    const prefix = script.dir ? `${runner} --filter ./${script.dir} ` : `${runner} `;
    const call = script.name === 'test' ? `${prefix}test` : `${prefix}run ${script.name}`;
    add(purpose, { comando: call, origem: `${script.file}:${script.line + 1} (scripts.${script.name} → ${script.command})`, nivel: 'media' });
  }
  for (const purpose of Object.keys(commands)) commands[purpose].sort((a, b) => levels[b.nivel] - levels[a.nivel]);
  return Object.fromEntries(Object.entries(commands).sort(([a], [b]) => a.localeCompare(b)));
}

// ---------------------------------------------------------------------------------------------
// Questions the agent reads

const personalFields = /\b(cpf|cnpj|rg|email|e_mail|phone|telefone|celular|birth\w*|nascimento|address|endereco)\b/i;
const sensitiveFields = /\b(health|saude|diagnosis|diagnostico|biometric\w*|card_number|cartao|salary|salario)\b/i;
const schemaFile = /(\.prisma|\.sql|(^|\/)models?\.py|(^|\/)(entities|models)\/[^/]+\.(cs|[jt]s|py|java|kt)|schema\.[jt]s)$/i;

function readingHints(ctx) {
  const hints = new Map();
  const add = (q, item) => {
    hints.set(q, hints.get(q) ?? []);
    if (item) hints.get(q).push(item);
  };
  const hasCode = ctx.projetos.length > 0;
  if (hasCode) for (const q of readingOnly) add(q);
  if (ctx.projetos.some((project) => project.tipo === 'backend')) for (const q of ['2.1', '2.4']) add(q);

  for (const file of ['README.md', 'readme.md', 'README']) {
    const lines = ctx.texts.get(file);
    if (!lines) continue;
    const index = lines.findIndex((line, at) => at > 0 && line.trim() && !line.startsWith('#'));
    if (index >= 0) add('1.2', evidence(ctx, file, index));
    break;
  }
  for (const [file, lines] of ctx.texts) {
    if (!schemaFile.test(file)) continue;
    lines.forEach((line, index) => {
      if (personalFields.test(line) || sensitiveFields.test(line)) add('1.5', evidence(ctx, file, index));
      if (/\b(tenant_id|tenantId|organization_id|company_id)\b/.test(line)) add('1.6', evidence(ctx, file, index));
    });
  }
  for (const [file] of ctx.texts) {
    if (/(^|\/)(Domain|Application|Infrastructure)\//.test(file)) add('2.1', fileEvidence(file.split('/').slice(0, -1).join('/')));
    else if (/(^|\/)(serverless\.yml|template\.yaml|host\.json)$/.test(file)) add('2.1', fileEvidence(file));
    if (/(^|\/)(commands|queries|handlers|services)\//.test(file)) add('2.3', fileEvidence(file.split('/').slice(0, -1).join('/')));
    if (/\.proto$/.test(file)) add('2.4', fileEvidence(file));
  }
  for (const dep of ctx.deps) {
    if (['amqplib', 'kafkajs', 'celery'].includes(dep.name) || dep.name.startsWith('MassTransit')) add('2.4', evidence(ctx, dep.file, dep.line));
  }
  return [...hints.entries()]
    .map(([pergunta, pistas]) => ({ pergunta, pistas: unique(pistas).slice(0, maxEvidence), ...(unique(pistas).length > maxEvidence ? { total: unique(pistas).length } : {}) }))
    .sort((a, b) => compareQuestions(a.pergunta, b.pergunta));
}

// ---------------------------------------------------------------------------------------------
// Assembly

function compareQuestions(a, b) {
  const [a1, a2] = a.split('.').map(Number);
  const [b1, b2] = b.split('.').map(Number);
  return a1 - b1 || a2 - b2;
}

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => (a.arquivo ?? '').localeCompare(b.arquivo ?? '') || (a.linha ?? 0) - (b.linha ?? 0));
}

function combine(found) {
  const byQuestion = new Map();
  for (const item of found) {
    if (!byQuestion.has(item.q)) byQuestion.set(item.q, new Map());
    const options = byQuestion.get(item.q);
    const current = options.get(item.v) ?? { valor: item.v, rotulo: item.rotulo, nivel: 'baixa', evidencias: [] };
    if (levels[item.nivel] > levels[current.nivel]) current.nivel = item.nivel;
    current.evidencias.push(...item.evidencias);
    options.set(item.v, current);
  }
  const signals = [];
  for (const [q, options] of byQuestion) {
    // 2.5: scheduled jobs and queues together are option 4.
    if (q === '2.5' && options.has('2') && options.has('3')) {
      const both = { valor: '4', rotulo: 'Jobs agendados e filas', nivel: [...options.values()].reduce((max, item) => (levels[item.nivel] > levels[max] ? item.nivel : max), 'baixa'), evidencias: [...options.get('2').evidencias, ...options.get('3').evidencias] };
      options.clear();
      options.set('4', both);
    }
    const list = [...options.values()].map((item) => ({ ...item, evidencias: limited(item.evidencias) }))
      .sort((a, b) => String(a.valor).localeCompare(String(b.valor), undefined, { numeric: true }));
    if (multiple.has(q)) {
      const nivel = list.reduce((min, item) => (levels[item.nivel] < levels[min] ? item.nivel : min), 'alta');
      signals.push({ pergunta: q, valor: list.map((item) => item.valor), rotulo: list.map((item) => item.rotulo).join(', '), confianca: nivel, evidencias: limited(list.flatMap((item) => item.evidencias)), conflitos: [] });
    } else if (list.length === 1) {
      const [item] = list;
      signals.push({ pergunta: q, valor: item.valor, rotulo: item.rotulo, confianca: item.nivel, evidencias: item.evidencias, conflitos: [] });
    } else {
      signals.push({ pergunta: q, valor: null, rotulo: null, confianca: 'conflito', evidencias: [], conflitos: list.map((item) => ({ valor: item.valor, rotulo: item.rotulo, confianca: item.nivel, evidencias: item.evidencias })) });
    }
  }
  return signals.sort((a, b) => compareQuestions(a.pergunta, b.pergunta));
}

function limited(evidences) {
  const all = unique(evidences);
  return all.length > maxEvidence ? [...all.slice(0, maxEvidence), { total: all.length }] : all;
}

function gitInfo(root) {
  const current = git(root, ['rev-parse', '--abbrev-ref', 'HEAD'])?.trim() || null;
  const branches = (git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads']) ?? '').split('\n').map((line) => line.trim()).filter(Boolean).sort();
  const originHead = git(root, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])?.trim();
  const main = originHead ? originHead.replace(/^origin\//, '') : ['main', 'master'].find((name) => branches.includes(name)) ?? null;
  const url = git(root, ['remote', 'get-url', 'origin'])?.trim();
  let remoto = null;
  if (url) {
    const match = url.match(/^(?:[a-z+]+:\/\/)?(?:[^@/]+@)?([^/:]+)[:/](.+?)(?:\.git)?\/?$/i);
    if (match) remoto = { host: match[1], caminho: match[2] };
  }
  const commits = Number(git(root, ['rev-list', '--count', 'HEAD'])?.trim() ?? 0) || 0;
  // E-mails are counted and dropped here: the output has only the number of people.
  const people = new Set((git(root, ['log', '--since=12.months', '--format=%ae']) ?? '').split('\n').map((line) => line.trim().toLowerCase()).filter(Boolean)).size;
  return { branchAtual: current, branchPrincipal: main, branches, remoto, commits, pessoas12Meses: people };
}

function warnings(ctx) {
  const list = [];
  for (const file of ctx.allTracked) {
    if (envFile.test(file) && !envSample.test(file)) list.push({ tipo: 'risco', texto: 'Arquivo .env rastreado pelo Git', arquivo: file });
  }
  if (ctx.projetos.length > 0 && !ctx.signals.some((signal) => signal.pergunta === '5.4')) list.push({ tipo: 'achado', texto: 'Nenhum framework de testes encontrado' });
  if (ctx.projetos.length > 0 && !ctx.signals.some((signal) => signal.pergunta === '5.2')) list.push({ tipo: 'achado', texto: 'Nenhum CI encontrado' });
  for (const signal of ctx.signals.filter((item) => item.confianca === 'conflito')) {
    list.push({ tipo: 'ambiguidade', texto: `Respostas em conflito: ${signal.conflitos.map((item) => item.rotulo).join(' e ')}`, pergunta: signal.pergunta });
  }
  return list.sort((a, b) => a.tipo.localeCompare(b.tipo) || (a.arquivo ?? a.pergunta ?? '').localeCompare(b.arquivo ?? b.pergunta ?? ''));
}

function inspect({ raiz, escopo = [] }) {
  const root = path.resolve(raiz);
  const allTracked = (git(root, ['ls-files', '-z']) ?? '').split('\0').filter(Boolean);
  const { files, beyondLimit } = listFiles(root, escopo);
  // .env files other than samples are never read: only their existence matters.
  const readable = files.filter((file) => !envFile.test(file) || envSample.test(file));
  const { texts, large } = readTexts(root, readable);
  const ctx = { root, files, texts, allTracked };
  Object.assign(ctx, parseManifests(ctx));
  ctx.imports = collectImports(ctx);
  ctx.git = gitInfo(root);
  ctx.ciSteps = ciSteps(ctx);
  ctx.projetos = classifyProjects(ctx);
  ctx.found = applyCatalog(ctx);
  ctx.found.push(...structuralSignals(ctx));
  ctx.signals = combine(ctx.found);
  const contratos = ctx.found.filter((item) => item.contrato)
    .map((item) => ({ tipo: item.contrato, caminho: item.arquivo }))
    .sort((a, b) => a.caminho.localeCompare(b.caminho));
  return {
    versao: 1,
    raiz: root.split(path.sep).join('/'),
    truncado: beyondLimit > 0 || large > 0,
    ...(beyondLimit > 0 || large > 0 ? { foraDoLimite: { arquivos: beyondLimit, grandes: large } } : {}),
    escopo,
    git: ctx.git,
    projetos: ctx.projetos.map(({ caminho, tipo, manifest }) => ({ caminho, tipo, manifest })),
    sinais: ctx.signals,
    comandos: verificationCommands(ctx),
    contratos,
    requerLeitura: readingHints(ctx),
    avisos: warnings(ctx),
  };
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(2);
  }
  if (options.help) {
    usage();
    return;
  }
  try {
    const result = inspect(options);
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (options.json) writeFileSync(options.json, text);
    else process.stdout.write(text);
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(error instanceof UsageError ? 2 : 1);
  }
}

main();
