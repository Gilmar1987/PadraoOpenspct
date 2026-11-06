#!/usr/bin/env node

// Checks scripts/inspecionar-codigo.mjs against the fixtures in scripts/test-fixtures/inspecao (ADR-0010).
// Requirements "Inspeção somente leitura do código", "Respostas detectadas com evidência e confiança",
// "Perguntas que exigem leitura do agente", "Saída sem secrets nem dados pessoais", "Arquivos de dados sem
// trecho" and "Limites e escopo da inspeção" (code-inspection), and "Inspeção do código conferida contra
// fixtures" (continuous-validation). Each fixture is copied to a temporary folder and committed with
// git init, so git ls-files sees the fixture and not this repository.

import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const scriptsDir = path.dirname(path.resolve(process.argv[1]));
const script = path.join(scriptsDir, 'inspecionar-codigo.mjs');
const fixturesDir = path.join(scriptsDir, 'test-fixtures', 'inspecao');
const failures = [];
const fail = (message) => failures.push(message);

const gitEnv = { ...process.env, GIT_AUTHOR_NAME: 'ci', GIT_AUTHOR_EMAIL: 'ci@example.invalid', GIT_COMMITTER_NAME: 'ci', GIT_COMMITTER_EMAIL: 'ci@example.invalid' };
const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', env: gitEnv, stdio: ['ignore', 'pipe', 'ignore'] });

// Steps per fixture: files created before the commit (tracked) and after it (untracked).
const setup = {
  // Scenario "Arquivo .env rastreado": the .env with fake values exists only in the temporary copy.
  'existente-secrets': { tracked: { '.env': 'DATABASE_URL=postgres://app:VALOR_FALSO_123@db/app\nAPI_KEY=VALOR_FALSO_123\n' } },
  // Scenario "Arquivo não rastreado ignorado": an untracked Express app must not change the .NET answer.
  'existente-dotnet': { untracked: { 'extra/package.json': '{ "dependencies": { "express": "^4.21.1" } }\n', 'extra/index.js': "require('express');\n" } },
};

function prepare(name) {
  const repo = path.join(mkdtempSync(path.join(tmpdir(), 'inspecao-')), name);
  cpSync(path.join(fixturesDir, name), repo, { recursive: true, filter: (source) => path.basename(source) !== 'esperado.json' });
  for (const [file, text] of Object.entries(setup[name]?.tracked ?? {})) writeFileSync(path.join(repo, file), text);
  git(repo, ['init', '-q', '-b', 'main']);
  git(repo, ['add', '-A']);
  git(repo, ['commit', '-q', '-m', 'fixture']);
  for (const [file, text] of Object.entries(setup[name]?.untracked ?? {})) {
    mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    writeFileSync(path.join(repo, file), text);
  }
  return repo;
}

function run(repo, extra = []) {
  const out = execFileSync(process.execPath, [script, '--raiz', repo, ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return { text: out, data: JSON.parse(out) };
}

// The part of the output the expected file pins down: answers, levels, conflicts, commands, reading list,
// warnings and projects. Evidence lists are checked by the rules below, not line by line.
function projection(data) {
  const sinais = {};
  for (const signal of data.sinais) {
    sinais[signal.pergunta] = signal.confianca === 'conflito'
      ? { conflitos: signal.conflitos.map((item) => item.valor) }
      : { valor: signal.valor, confianca: signal.confianca };
  }
  return {
    projetos: data.projetos.map((item) => [item.caminho, item.tipo]),
    sinais,
    comandos: Object.fromEntries(Object.entries(data.comandos).map(([purpose, list]) => [purpose, list[0].comando])),
    requerLeitura: data.requerLeitura.map((item) => item.pergunta),
    avisos: data.avisos.map((item) => `${item.tipo}: ${item.texto}${item.arquivo ? ` (${item.arquivo})` : ''}`),
  };
}

function compare(name, expected, actual) {
  for (const key of ['projetos', 'comandos', 'requerLeitura', 'avisos']) {
    if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
      fail(`${name}: ${key} esperado ${JSON.stringify(expected[key])}, obtido ${JSON.stringify(actual[key])}`);
    }
  }
  const questions = new Set([...Object.keys(expected.sinais), ...Object.keys(actual.sinais)]);
  for (const q of questions) {
    if (JSON.stringify(expected.sinais[q]) !== JSON.stringify(actual.sinais[q])) {
      fail(`${name}: pergunta ${q} esperada ${JSON.stringify(expected.sinais[q] ?? 'sem sinal')}, obtida ${JSON.stringify(actual.sinais[q] ?? 'sem sinal')}`);
    }
  }
}

function allEvidence(data) {
  const list = [];
  for (const signal of data.sinais) {
    list.push(...signal.evidencias, ...signal.conflitos.flatMap((item) => item.evidencias));
  }
  for (const item of data.requerLeitura) list.push(...item.pistas);
  return list.filter((item) => item.arquivo);
}

const dataFile = (file) => /(^|\/)seed[^/]*$/i.test(file) || /\.csv$/i.test(file) || /(^|\/)(fixtures|testdata)\//i.test(file);

const fixtures = readdirSync(fixturesDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
if (fixtures.length === 0) fail('nenhum fixture em scripts/test-fixtures/inspecao');
const temporary = [];

for (const name of fixtures) {
  const expectedPath = path.join(fixturesDir, name, 'esperado.json');
  if (!existsSync(expectedPath)) {
    fail(`${name}: falta esperado.json`);
    continue;
  }
  let repo;
  try {
    repo = prepare(name);
    temporary.push(path.dirname(repo));
    const statusBefore = git(repo, ['status', '--porcelain', '--untracked-files=all']);
    const first = run(repo);
    const second = run(repo);
    compare(name, JSON.parse(readFileSync(expectedPath, 'utf8')), projection(first.data));
    // Scenario "Saída repetível".
    if (first.text !== second.text) fail(`${name}: duas execuções deram saídas diferentes`);
    // Scenario "Script de pacote não executado": nothing written, no postinstall run.
    if (git(repo, ['status', '--porcelain', '--untracked-files=all']) !== statusBefore) fail(`${name}: o git status mudou depois da inspeção`);
    if (existsSync(path.join(repo, 'SENTINELA'))) fail(`${name}: o postinstall do package.json foi executado`);
    // Requirement "Saída sem secrets nem dados pessoais".
    if (/VALOR_FALSO/.test(first.text)) fail(`${name}: um valor do .env apareceu na saída`);
    if (/fulano@example\.invalid|000\.000\.000-00/.test(first.text)) fail(`${name}: um dado pessoal do seed apareceu na saída`);
    // Requirement "Arquivos de dados sem trecho".
    for (const item of allEvidence(first.data)) {
      if (dataFile(item.arquivo) && 'trecho' in item) fail(`${name}: evidência de arquivo de dados com trecho (${item.arquivo}:${item.linha})`);
      if (item.trecho && item.trecho.length > 120) fail(`${name}: trecho com mais de 120 caracteres (${item.arquivo}:${item.linha})`);
    }
    // Scenario "Escopo restrito".
    if (name === 'existente-node-next') {
      const scoped = run(repo, ['--escopo', 'apps/api']).data;
      if (allEvidence(scoped).some((item) => item.arquivo.startsWith('apps/web/'))) fail(`${name}: --escopo apps/api trouxe evidência de apps/web`);
      if (scoped.projetos.some((item) => item.caminho === 'apps/web')) fail(`${name}: --escopo apps/api listou apps/web`);
    }
  } catch (error) {
    fail(`${name}: ${error.message.split('\n')[0]}`);
  }
}

// Requirement "Inspeção do código conferida contra fixtures": the script imports only node:fs, node:path
// and node:child_process, and runs no program but git.
const source = existsSync(script) ? readFileSync(script, 'utf8') : '';
if (!source) fail('falta scripts/inspecionar-codigo.mjs');
for (const match of source.matchAll(/^\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/gm)) {
  if (!['node:fs', 'node:path', 'node:child_process'].includes(match[1])) fail(`inspecionar-codigo.mjs importa ${match[1]}`);
}
if (/\brequire\s*\(|\bimport\s*\(/.test(source)) fail('inspecionar-codigo.mjs usa require ou import dinâmico');
for (const match of source.matchAll(/\b(exec|execSync|execFile|execFileSync|spawn|spawnSync|fork)\s*\(\s*([^,)]*)/g)) {
  if (match[2].trim() !== "'git'") fail(`inspecionar-codigo.mjs chama ${match[1]}(${match[2].trim()}), e só o git é permitido`);
}

for (const dir of temporary) rmSync(dir, { recursive: true, force: true });

if (failures.length) {
  console.error(`Teste da inspeção: ${failures.length} falha(s)`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}
console.log(`Teste da inspeção: ${fixtures.length} fixtures ok`);
