#!/usr/bin/env node

// The standard's interface validation: opens the application's URL in a real browser, as a user would,
// and writes interface-report.md/.json with an automatic grade. Delivered to the code repository as
// docs/openspec-validar-interface.mjs. Playwright, axe-core and the browser are installed once in a
// temporary folder outside the repository (OPENSPEC_VALIDAR_INTERFACE_DIR, or the system temp folder),
// never in the project and never in the machine's shared Playwright cache, whose unused browsers a
// Playwright install would otherwise remove.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const EXIT_OK = 0;
const EXIT_WEAK = 1;
const EXIT_ERROR = 2;
// Fixed versions: a new one is a change of the standard, checked by the CI smoke test.
const PLAYWRIGHT_VERSION = '1.64.1';
const AXE_VERSION = '4.14.0';
const widths = [390, 768, 1280];
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const stepTimeout = 10000;
const maxLinks = 50;

class UsageError extends Error {}

function usage() {
  return `Uso: node docs/openspec-validar-interface.mjs <url> [--jornadas <arquivo>] [--saida <pasta>] [--json]

  <url>                endereço da aplicação rodando (por exemplo, http://localhost:3000/)
  --jornadas <arquivo> jornadas de usuário: {"jornadas": [{"nome": "...", "passos": [...]}]} ou uma
                       lista de passos; passos: {"visitar": "/caminho"}, {"clicar": "texto ou rótulo"},
                       {"preencher": {"Rótulo": "valor"}}, {"conferir": "texto esperado"}
  --saida <pasta>      onde gravar interface-report.md/.json e interface/capturas/ (padrão: pasta atual)
  --json               imprime o relatório em JSON

Saída: 0 com nota médio ou bom, 1 com nota fraco, 2 em erro de uso ou de ambiente.
Na primeira execução, instala playwright@${PLAYWRIGHT_VERSION} e @axe-core/playwright@${AXE_VERSION}
numa pasta temporária e baixa o Chromium (cerca de 100 MB).`;
}

function parseArgs(args) {
  const options = { url: null, journeys: null, output: '.', json: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = () => {
      const next = args[index + 1];
      if (next === undefined || next.startsWith('--')) throw new UsageError(`${arg} precisa de um valor.`);
      index += 1;
      return next;
    };
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--jornadas') options.journeys = value();
    else if (arg === '--saida') options.output = value();
    else if (arg.startsWith('--')) throw new UsageError(`Opção desconhecida: ${arg}`);
    else if (options.url === null) options.url = arg;
    else throw new UsageError(`Argumento a mais: ${arg}`);
  }
  if (options.help) return options;
  if (!options.url) throw new UsageError('Informe a URL da aplicação.');
  let url;
  try {
    url = new URL(options.url);
  } catch {
    throw new UsageError(`URL inválida: ${options.url}`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new UsageError(`Use uma URL http ou https: ${options.url}`);
  options.url = url.href;
  return options;
}

// Journeys file: {"jornadas": [{"nome", "passos"}]} or a plain list of steps (one journey).
function readJourneys(file) {
  if (!file) return [];
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new UsageError(`Não consegui ler as jornadas em ${file}: ${error.message}`);
  }
  const journeys = Array.isArray(data) ? [{ nome: 'Jornada', passos: data }] : data?.jornadas;
  if (!Array.isArray(journeys) || journeys.some((journey) => !Array.isArray(journey?.passos))) {
    throw new UsageError(`Formato de jornadas inválido em ${file}: use {"jornadas": [{"nome": "...", "passos": [...]}]}.`);
  }
  return journeys.map((journey, index) => ({ nome: String(journey.nome ?? `Jornada ${index + 1}`), passos: journey.passos }));
}

async function checkReachable(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' });
  } catch (error) {
    throw new UsageError(`Não consegui abrir ${url}: ${error.cause?.code ?? error.message}. Suba a aplicação e rode de novo.`);
  }
}

function run(command, args, cwd) {
  const options = { cwd, stdio: ['ignore', process.stderr, process.stderr] };
  // On Windows, npm is a .cmd shim that spawnSync only starts through a shell; the words are fixed.
  const result = process.platform === 'win32' && command === 'npm'
    ? spawnSync([command, ...args].join(' '), { ...options, shell: true })
    : spawnSync(command, args, options);
  if (result.error || result.status !== 0) {
    throw new UsageError(`Falhou: ${command} ${args.join(' ')} (${result.error?.message ?? `saída ${result.status}`}).`);
  }
}

// Installs Playwright and axe-core once, outside the project, and returns the loaded modules.
function environment() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) throw new UsageError(`O Playwright precisa do Node.js 20 ou mais novo (este é ${process.versions.node}).`);
  const base = process.env.OPENSPEC_VALIDAR_INTERFACE_DIR || path.join(os.tmpdir(), 'openspec-validar-interface');
  const dir = path.join(base, `playwright-${PLAYWRIGHT_VERSION}-axe-${AXE_VERSION}`);
  // A browser folder of our own: Playwright reads it at install and at launch.
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(base, 'navegadores');
  const installed = (name) => existsSync(path.join(dir, 'node_modules', ...name.split('/'), 'package.json'));
  if (!installed('playwright') || !installed('@axe-core/playwright')) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify({ name: 'openspec-validar-interface', private: true }, null, 2)}\n`);
    process.stderr.write(`Instalando playwright@${PLAYWRIGHT_VERSION} e @axe-core/playwright@${AXE_VERSION} em ${dir} (só na primeira vez)...\n`);
    run('npm', ['install', '--no-audit', '--no-fund', '--save-exact', `playwright@${PLAYWRIGHT_VERSION}`, `@axe-core/playwright@${AXE_VERSION}`], dir);
  }
  // Idempotent: downloads the browser only when it is missing.
  process.stderr.write('Conferindo o Chromium do Playwright (o primeiro download tem cerca de 100 MB)...\n');
  run(process.execPath, [path.join(dir, 'node_modules', 'playwright', 'cli.js'), 'install', '--only-shell', 'chromium'], dir);
  const load = createRequire(path.join(dir, 'package.json'));
  const axe = load('@axe-core/playwright');
  return { chromium: load('playwright').chromium, AxeBuilder: axe.default ?? axe.AxeBuilder };
}

const firstLine = (text) => String(text ?? '').split('\n')[0].trim();

// The same message seen at several widths or journeys counts once, with every place it appeared.
function watchConsole(page, sink, where) {
  const add = (text) => {
    const mensagem = firstLine(text);
    const existing = sink.find((item) => item.mensagem === mensagem);
    if (!existing) sink.push({ mensagem, onde: [where] });
    else if (!existing.onde.includes(where)) existing.onde.push(where);
  };
  page.on('console', (message) => {
    if (message.type() === 'error') add(message.text());
  });
  page.on('pageerror', (error) => add(error.message));
}

function mergeViolations(target, violations, width) {
  for (const violation of violations) {
    const existing = target.find((item) => item.id === violation.id);
    if (existing) {
      if (!existing.larguras.includes(width)) existing.larguras.push(width);
      continue;
    }
    target.push({
      id: violation.id,
      impacto: violation.impact ?? 'minor',
      descricao: violation.help,
      ocorrencias: violation.nodes.length,
      alvos: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
      larguras: [width],
    });
  }
}

async function scanWidths(browser, AxeBuilder, report, capturas) {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    watchConsole(page, report.console, `página inicial em ${width} px`);
    await page.goto(report.url, { waitUntil: 'networkidle', timeout: 30000 });
    const file = path.join(capturas, `inicio-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    report.capturas.push(`interface/capturas/inicio-${width}.png`);
    const result = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    mergeViolations(report.acessibilidade, result.violations, width);
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
      report.transbordo.push(width);
    }
    if (width === widths[0]) {
      report.pagina = await page.evaluate(() => ({
        titulo: document.title.trim(),
        lang: document.documentElement.getAttribute('lang') ?? '',
        descricao: document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '',
        favicon: document.querySelector('link[rel~="icon"]')?.href ?? '',
        links: [...new Set([...document.querySelectorAll('a[href]')]
          .map((link) => link.href.split('#')[0])
          .filter((href) => href.startsWith(location.origin)))],
      }));
      if (!report.pagina.favicon) {
        const fallback = new URL('/favicon.ico', report.url).href;
        const response = await context.request.get(fallback).catch(() => null);
        if (response?.ok()) report.pagina.favicon = fallback;
      }
      for (const href of report.pagina.links.slice(0, maxLinks)) {
        const response = await context.request.get(href).catch((error) => ({ status: () => 0, error }));
        report.links.push({ href: new URL(href).pathname, status: response.status() });
      }
      delete report.pagina.links;
    }
    await context.close();
  }
}

async function checkNotFound(browser, report) {
  const context = await browser.newContext();
  const target = new URL(`/openspec-pagina-inexistente-${Date.now()}`, report.url).href;
  const response = await context.request.get(target).catch(() => null);
  const text = response ? (await response.text()).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  report.pagina404 = { status: response?.status() ?? 0, caracteres: text.length };
  await context.close();
}

async function runStep(page, step, baseUrl) {
  const [kind, value] = Object.entries(step ?? {})[0] ?? [];
  if (kind === 'visitar') {
    await page.goto(new URL(String(value), baseUrl).href, { waitUntil: 'networkidle', timeout: 30000 });
  } else if (kind === 'clicar') {
    const name = String(value);
    const candidates = [
      page.getByRole('button', { name }), page.getByRole('link', { name }), page.getByLabel(name), page.getByText(name),
    ];
    let target = null;
    for (const candidate of candidates) {
      if (await candidate.count() > 0) {
        target = candidate.first();
        break;
      }
    }
    if (!target) throw new Error(`nada clicável com o texto ou rótulo "${name}"`);
    await target.click({ timeout: stepTimeout });
    await page.waitForLoadState('networkidle', { timeout: stepTimeout }).catch(() => {});
  } else if (kind === 'preencher') {
    for (const [label, text] of Object.entries(value ?? {})) {
      const field = page.getByLabel(label);
      const target = await field.count() > 0 ? field.first() : page.getByPlaceholder(label).first();
      await target.fill(String(text), { timeout: stepTimeout });
    }
  } else if (kind === 'conferir') {
    await page.getByText(String(value)).first().waitFor({ state: 'visible', timeout: stepTimeout });
  } else {
    throw new Error(`passo desconhecido: ${JSON.stringify(step)}`);
  }
}

async function runJourneys(browser, journeys, report, capturas) {
  for (const [journeyIndex, journey] of journeys.entries()) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    watchConsole(page, report.console, `jornada "${journey.nome}"`);
    const result = { nome: journey.nome, passos: [], ok: true };
    for (const [stepIndex, step] of journey.passos.entries()) {
      const label = JSON.stringify(step);
      try {
        await runStep(page, step, report.url);
        const done = { passo: label, ok: true };
        // A "conferir" step shows a state of the screen (error, success, empty): keep its picture.
        if (Object.keys(step ?? {})[0] === 'conferir') {
          const shot = `jornada-${journeyIndex + 1}-passo-${stepIndex + 1}.png`;
          await page.screenshot({ path: path.join(capturas, shot), fullPage: true });
          done.captura = `interface/capturas/${shot}`;
        }
        result.passos.push(done);
      } catch (error) {
        const shot = `jornada-${journeyIndex + 1}-passo-${stepIndex + 1}.png`;
        await page.screenshot({ path: path.join(capturas, shot), fullPage: true }).catch(() => {});
        result.passos.push({ passo: label, ok: false, erro: firstLine(error.message), captura: `interface/capturas/${shot}` });
        result.ok = false;
        break;
      }
    }
    report.jornadas.push(result);
    await context.close();
  }
}

// Automatic grade (skill interface-quality): "fraco", "médio" or "bom"; "ótimo" is the validator's call.
function grade(report, hadJourneys) {
  const weak = [];
  const finish = [];
  const serious = report.acessibilidade.filter((item) => ['serious', 'critical'].includes(item.impacto));
  const other = report.acessibilidade.filter((item) => !['serious', 'critical'].includes(item.impacto));
  const failed = report.jornadas.filter((journey) => !journey.ok);
  const broken = report.links.filter((link) => link.status === 0 || link.status >= 400);
  if (failed.length) weak.push(`${failed.length} jornada(s) falharam: ${failed.map((journey) => journey.nome).join(', ')}`);
  if (serious.length) weak.push(`violações de acessibilidade sérias ou críticas: ${serious.map((item) => item.id).join(', ')}`);
  if (report.console.length) weak.push(`${report.console.length} erro(s) de console ou de página`);
  if (broken.length) weak.push(`links internos quebrados: ${broken.map((link) => link.href).join(', ')}`);
  if (!report.pagina.titulo) weak.push('a página não tem título');
  if (other.length) finish.push(`violações de acessibilidade moderadas ou menores: ${other.map((item) => item.id).join(', ')}`);
  if (report.transbordo.length) finish.push(`rolagem horizontal em ${report.transbordo.join(', ')} px`);
  if (!report.pagina.favicon) finish.push('sem favicon');
  if (!report.pagina.descricao) finish.push('sem meta description');
  if (report.pagina404.status !== 404 || report.pagina404.caracteres < 20) {
    finish.push(`rota inexistente sem página 404 com conteúdo (status ${report.pagina404.status})`);
  }
  if (!hadJourneys) finish.push('sem jornadas: nenhuma interação de usuário foi conferida');
  report.motivos = [...weak, ...finish];
  return weak.length ? 'fraco' : finish.length ? 'médio' : 'bom';
}

const yes = (value) => (value ? 'sim' : 'não');
// Text from the page or from axe goes into Markdown: angle brackets would read as inline HTML.
const inline = (text) => String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');

function markdown(report) {
  const lines = [
    '# Relatório de interface',
    '',
    `- URL: <${report.url}>`,
    `- Data: ${report.data}`,
    `- Ferramentas: playwright ${PLAYWRIGHT_VERSION}, @axe-core/playwright ${AXE_VERSION} (WCAG 2.2 AA)`,
    `- Nota automática: **${report.nota}**`,
    '',
    'A nota automática vai até "bom". A nota final é a da seção "Avaliação do validador", acrescentada depois',
    'pelo subagente validador de interface.',
    '',
    '## Motivos da nota',
    '',
    ...(report.motivos.length ? report.motivos.map((reason) => `- ${reason}`) : ['- Nenhum problema encontrado pelo script.']),
    '',
    '## Capturas',
    '',
    ...report.capturas.map((file) => `- [${path.basename(file)}](${file})`),
    '',
    '## Acessibilidade',
    '',
  ];
  if (report.acessibilidade.length) {
    lines.push('| Regra | Impacto | Descrição | Ocorrências | Larguras | Exemplos |', '|---|---|---|---|---|---|');
    for (const item of report.acessibilidade) {
      lines.push(`| ${item.id} | ${item.impacto} | ${inline(item.descricao).replace(/\|/g, '\\|')} | ${item.ocorrencias} | ${item.larguras.join(', ')} | ${item.alvos.map((target) => `\`${target.replace(/\|/g, '\\|')}\``).join(', ')} |`);
    }
  } else {
    lines.push('Nenhuma violação encontrada pelo axe-core.');
  }
  lines.push('', '## Console', '');
  lines.push(...(report.console.length ? report.console.map((item) => `- ${inline(item.mensagem)} (${item.onde.join('; ')})`) : ['Nenhum erro de console ou de página.']));
  lines.push('', '## Links internos', '');
  lines.push(...(report.links.length ? report.links.map((link) => `- ${link.href} → ${link.status || 'sem resposta'}`) : ['Nenhum link interno na página inicial.']));
  lines.push('', '## Página', '');
  lines.push(
    `- Título: ${inline(report.pagina.titulo) || '(ausente)'}`,
    `- Idioma (lang): ${report.pagina.lang || '(ausente)'}`,
    `- Meta description: ${yes(report.pagina.descricao)}`,
    `- Favicon: ${yes(report.pagina.favicon)}`,
    `- Rota inexistente: status ${report.pagina404.status}, ${report.pagina404.caracteres} caracteres de texto`,
    `- Rolagem horizontal: ${report.transbordo.length ? `${report.transbordo.join(', ')} px` : 'nenhuma'}`,
  );
  lines.push('', '## Jornadas', '');
  if (!report.jornadas.length) lines.push('Nenhuma jornada informada (use --jornadas).');
  for (const journey of report.jornadas) {
    lines.push(`### ${journey.nome}: ${journey.ok ? 'aprovada' : 'reprovada'}`, '');
    for (const step of journey.passos) {
      const shot = step.captura ? ` ([captura](${step.captura}))` : '';
      lines.push(`- ${step.ok ? 'ok' : 'falhou'}: \`${step.passo}\`${step.ok ? shot : ` — ${step.erro}${shot}`}`);
    }
    lines.push('');
  }
  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return EXIT_OK;
  }
  const journeys = readJourneys(options.journeys);
  await checkReachable(options.url);
  const { chromium, AxeBuilder } = environment();
  const output = path.resolve(options.output);
  const capturas = path.join(output, 'interface', 'capturas');
  mkdirSync(capturas, { recursive: true });
  const report = {
    url: options.url, data: new Date().toISOString(), nota: null, motivos: [], capturas: [], acessibilidade: [],
    console: [], links: [], pagina: {}, pagina404: {}, transbordo: [], jornadas: [],
  };
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    throw new UsageError(`Não consegui abrir o Chromium: ${firstLine(error.message)}`);
  }
  try {
    await scanWidths(browser, AxeBuilder, report, capturas);
    await checkNotFound(browser, report);
    await runJourneys(browser, journeys, report, capturas);
  } finally {
    await browser.close();
  }
  report.nota = grade(report, journeys.length > 0);
  writeFileSync(path.join(output, 'interface-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(output, 'interface-report.md'), markdown(report));
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(`Nota automática: ${report.nota}\n${report.motivos.map((reason) => `- ${reason}`).join('\n')}${report.motivos.length ? '\n' : ''}`);
    process.stdout.write(`Relatório: ${path.join(output, 'interface-report.md')}\n`);
  }
  return report.nota === 'fraco' ? EXIT_WEAK : EXIT_OK;
}

main().then((code) => {
  process.exitCode = code;
}, (error) => {
  const message = error instanceof UsageError ? error.message : `Erro inesperado: ${error.stack ?? error}`;
  process.stderr.write(`${message}\n`);
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify({ ok: false, erro: message })}\n`);
  }
  if (error instanceof UsageError && /Informe a URL|Opção desconhecida|precisa de um valor|Argumento a mais/.test(message)) {
    process.stderr.write(`${usage()}\n`);
  }
  process.exitCode = EXIT_ERROR;
});
