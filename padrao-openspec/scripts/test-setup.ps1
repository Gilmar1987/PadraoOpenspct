#Requires -Version 5.1
<#
.SYNOPSIS
    Testa o fluxo completo: clone do repositório → setup → verificação dos artefatos.

.PARAMETER WorkDir
    Diretório base para o teste  (padrão: C:\teste-openspec)

.PARAMETER RepoUrl
    URL do repositório a clonar  (padrão: https://github.com/Gilmar1987/PadraoOpenspct)

.PARAMETER KeepOnSuccess
    Mantém os diretórios criados mesmo quando todos os checks passam.

.EXAMPLE
    .\test-setup.ps1
    .\test-setup.ps1 -WorkDir C:\tmp\teste
#>
param(
    [string]$WorkDir = 'C:\teste-openspec',

    [string]$RepoUrl = 'https://github.com/Gilmar1987/PadraoOpenspct',

    [switch]$KeepOnSuccess
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── helpers ──────────────────────────────────────────────────────────────────

$script:passed  = 0
$script:failed  = 0
$script:results = [System.Collections.Generic.List[hashtable]]::new()

function Check {
    param([string]$Label, [scriptblock]$Test)
    try {
        $ok = & $Test
        if ($ok) {
            $script:passed++
            $script:results.Add(@{ ok = $true;  label = $Label })
        } else {
            $script:failed++
            $script:results.Add(@{ ok = $false; label = $Label })
        }
    } catch {
        $script:failed++
        $script:results.Add(@{ ok = $false; label = "$Label  [$($_.Exception.Message)]" })
    }
}

function Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Info([string]$msg)  { Write-Host "    $msg"  -ForegroundColor Gray  }

# ── caminhos ─────────────────────────────────────────────────────────────────

$storeDir  = Join-Path $WorkDir 'store'        # clone do PadraoOpenspct
$codeDir   = Join-Path $WorkDir 'meu-projeto'  # repositório de código fictício
$setupScript = Join-Path $storeDir 'padrao-openspec\scripts\setup-project.mjs'

# ── pré-requisitos ────────────────────────────────────────────────────────────

Step 'Verificando pré-requisitos'

Check 'git disponível no PATH' { (Get-Command git -ErrorAction SilentlyContinue) -ne $null }
Check 'node disponível no PATH' { (Get-Command node -ErrorAction SilentlyContinue) -ne $null }

if ($script:failed -gt 0) {
    Write-Host "`nPré-requisitos ausentes. Instale git e node antes de continuar." -ForegroundColor Red
    exit 1
}

# ── limpeza inicial ───────────────────────────────────────────────────────────

Step "Preparando diretório de trabalho: $WorkDir"

if (Test-Path $WorkDir) {
    Info "Removendo execução anterior..."
    Remove-Item $WorkDir -Recurse -Force
}
New-Item $WorkDir -ItemType Directory | Out-Null

# ── fase 1: clone ─────────────────────────────────────────────────────────────

Step "Fase 1 — Clone de $RepoUrl"

# Sem 2>&1: no PowerShell 5.1 o stderr do git vira erro terminante com ErrorActionPreference Stop.
git clone --quiet $RepoUrl $storeDir

Check 'Clone concluído (pasta store existe)'           { Test-Path $storeDir }
Check 'padrao-openspec/ presente'                      { Test-Path (Join-Path $storeDir 'padrao-openspec') }
Check 'Stores removidos ausentes (dotnet/nextjs)'      {
    -not (Test-Path (Join-Path $storeDir 'openspec-store-dotnet')) -and
    -not (Test-Path (Join-Path $storeDir 'openspec-store-nextjs'))
}
Check 'openspec/ da raiz presente'                     { Test-Path (Join-Path $storeDir 'openspec') }
Check 'openspec/adrs/template.md na raiz'              { Test-Path (Join-Path $storeDir 'openspec\adrs\template.md') }
Check 'sync-root.mjs existe'                           { Test-Path (Join-Path $storeDir 'padrao-openspec\scripts\sync-root.mjs') }
Check 'README.md na raiz'                              { Test-Path (Join-Path $storeDir 'README.md') }
Check 'setup-project.mjs existe'                       { Test-Path $setupScript }
Check '.amazonq/rules/openspec-rules.md existe'        { Test-Path (Join-Path $storeDir '.amazonq\rules\openspec-rules.md') }
Check '.github/copilot-instructions.md existe'         { Test-Path (Join-Path $storeDir '.github\copilot-instructions.md') }
Check '.cursorrules existe'                            { Test-Path (Join-Path $storeDir '.cursorrules') }
Check '.windsurfrules existe'                          { Test-Path (Join-Path $storeDir '.windsurfrules') }
Check 'openspec/rules.md (fonte única) existe'         { Test-Path (Join-Path $storeDir 'openspec\rules.md') }
Check 'Skills de workflow em .claude/skills/'          {
    $skills = @(
        'openspec-explore','openspec-propose','openspec-apply-change',
        'openspec-verify-change','openspec-archive-change',
        'openspec-sync-specs','openspec-update-change','requesting-code-review','docker'
    )
    $base = Join-Path $storeDir '.claude\skills'
    $skills | ForEach-Object { Test-Path (Join-Path $base "$_\SKILL.md") } | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -eq 0 }
}
Check 'Slash commands em .claude/commands/opsx/'       {
    $cmds = @('init','ingest','explore','propose','apply','verify','archive','sync','update')
    $base = Join-Path $storeDir '.claude\commands\opsx'
    $cmds | ForEach-Object { Test-Path (Join-Path $base "$_.md") } | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -eq 0 }
}
Check 'Subagentes em padrao-openspec/.github/agents/'  {
    $agents = @(
        'spec-architect','task-planner','code-implementer',
        'qa-validator','consistency-guardian','business-requirements-ingestor'
    )
    $base = Join-Path $storeDir 'padrao-openspec\.github\agents'
    $agents | ForEach-Object { Test-Path (Join-Path $base "$_.agent.md") } | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -eq 0 }
}

# ── fase 2: repositório de código ─────────────────────────────────────────────

Step 'Fase 2 — Criando repositório de código fictício'

New-Item $codeDir -ItemType Directory | Out-Null
Push-Location $codeDir
git init --quiet
Pop-Location

Check 'Diretório de código criado'  { Test-Path $codeDir }
Check '.git inicializado no código' { Test-Path (Join-Path $codeDir '.git') }

# ── fase 3: setup ─────────────────────────────────────────────────────────────

Step 'Fase 3 — Rodando setup-project.mjs'

$nodeArgs = @(
    $setupScript,
    $codeDir,
    '--name', 'Projeto Teste',
    '--no-register',
    '--yes'
)

# Operador & em vez de Start-Process: no PowerShell 5.1, -ArgumentList não preserva argumentos com espaço.
& node @nodeArgs
$setupExitCode = $LASTEXITCODE
Check "setup-project.mjs saiu com código 0" { $setupExitCode -eq 0 }

# ── fase 4: verificação dos artefatos ─────────────────────────────────────────

Step 'Fase 4 — Verificando artefatos instalados no repositório de código'

Check '.agents/skills/ criado no código'               { Test-Path (Join-Path $codeDir '.agents\skills') }
Check '.claude/skills/ criado no código (padrão both)'  { Test-Path (Join-Path $codeDir '.claude\skills\openspec-propose\SKILL.md') }
Check 'Comandos init e ingest instalados no código'     {
    (Test-Path (Join-Path $codeDir '.claude\commands\opsx\init.md')) -and
    (Test-Path (Join-Path $codeDir '.claude\commands\opsx\ingest.md'))
}
Check '.github/agents/ criado no código'               { Test-Path (Join-Path $codeDir '.github\agents') }
Check 'Skills de workflow instaladas no código'        {
    $skills = @(
        'openspec-explore','openspec-propose','openspec-apply-change',
        'openspec-verify-change','openspec-archive-change',
        'openspec-sync-specs','openspec-update-change'
    )
    $base = Join-Path $codeDir '.agents\skills'
    $skills | ForEach-Object { Test-Path (Join-Path $base "$_\SKILL.md") } | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -eq 0 }
}
Check '6 subagentes instalados no código'              {
    $agents = @(
        'spec-architect.agent.md','task-planner.agent.md','code-implementer.agent.md',
        'qa-validator.agent.md','consistency-guardian.agent.md','business-requirements-ingestor.agent.md'
    )
    $base = Join-Path $codeDir '.github\agents'
    $agents | ForEach-Object { Test-Path (Join-Path $base $_) } | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -eq 0 }
}
Check '.gitignore criado com /openspec/ ignorado'      {
    $gi = Join-Path $codeDir '.gitignore'
    (Test-Path $gi) -and ((Get-Content $gi -Raw) -match '/openspec/')
}

Step 'Fase 4 — Verificando o store'

$projectMd = Get-Content (Join-Path $storeDir 'padrao-openspec\openspec\project.md') -Raw -ErrorAction SilentlyContinue
$configChanged = git -C (Join-Path $storeDir 'padrao-openspec') status --porcelain -- openspec/config.yaml

Check 'project.md não contém placeholder {{Nome do Projeto}}' {
    $projectMd -and ($projectMd -notmatch '\{\{Nome do Projeto\}\}')
}
Check 'project.md contém o nome "Projeto Teste"'             {
    $projectMd -and ($projectMd -match 'Projeto Teste')
}
Check 'config.yaml continua neutro (sem preset)'             {
    -not $configChanged
}
Check 'Manifesto da versão do padrão no código'               {
    $manifest = Join-Path $codeDir '.openspec-padrao.json'
    (Test-Path $manifest) -and ((Get-Content $manifest -Raw | ConvertFrom-Json).version -match '^\d+\.\d+\.\d+$')
}
Check 'Workflow e guia de atualização no código'              {
    (Test-Path (Join-Path $codeDir '.github\workflows\openspec-padrao-update.yml')) -and
    (Test-Path (Join-Path $codeDir 'docs\openspec-padrao.md'))
}
Check 'Skills de stack ausentes no código'                    {
    -not (Test-Path (Join-Path $codeDir '.agents\skills\dotnet-implementation')) -and
    -not (Test-Path (Join-Path $codeDir '.agents\skills\nextjs-implementation'))
}

# ── relatório final ───────────────────────────────────────────────────────────

Write-Host "`n$('─' * 60)" -ForegroundColor DarkGray
Write-Host ' RESULTADO DOS CHECKS' -ForegroundColor White
Write-Host "$('─' * 60)" -ForegroundColor DarkGray

foreach ($r in $script:results) {
    if ($r.ok) {
        Write-Host "  [PASS] $($r.label)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($r.label)" -ForegroundColor Red
    }
}

Write-Host "$('─' * 60)" -ForegroundColor DarkGray
$total = $script:passed + $script:failed
Write-Host "  Total: $total   Passou: $($script:passed)   Falhou: $($script:failed)" -ForegroundColor White
Write-Host "$('─' * 60)`n" -ForegroundColor DarkGray

if ($script:failed -eq 0) {
    Write-Host 'Todos os checks passaram.' -ForegroundColor Green
    if (-not $KeepOnSuccess) {
        Info "Limpando $WorkDir..."
        Remove-Item $WorkDir -Recurse -Force
    }
    exit 0
} else {
    Write-Host "Artefatos preservados em: $WorkDir" -ForegroundColor Yellow
    exit 1
}
