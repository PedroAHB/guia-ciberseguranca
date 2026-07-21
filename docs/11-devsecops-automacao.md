---
description: "Ferramentas DevSecOps para automatizar SAST, segurança de contêineres e análise de infraestrutura como código."
---

# 11. DevSecOps e Automação de Segurança

Esta seção final rompe com o paradigma reativo do *pentest* tradicional (auditoria pontual sobre um sistema já implantado) para adotar uma postura preventiva e contínua. O foco recai sobre ferramentas operáveis via CLI, projetadas para integração nativa em *pipelines* de Integração e Entrega Contínuas (CI/CD), permitindo a detecção automatizada de vulnerabilidades em artefatos de *software*, imagens de contêiner e definições de Infraestrutura como Código (IaC) antes que atinjam o ambiente de produção.

!!! tip "Use códigos de saída como *quality gates*"
    Configure as ferramentas para retornar um código diferente de zero quando os critérios de risco forem violados. Dessa forma, o próprio sistema de CI bloqueia a promoção do artefato sem depender de análise manual.

| Ferramenta | Categoria | Analisa | Saída útil em CI |
| --- | --- | --- | --- |
| Trivy | SCA, contêineres e IaC | Imagens, dependências, segredos e configurações | SARIF, JSON, SBOM e código de saída |
| Checkov | IaC | Terraform, Kubernetes, CloudFormation e outros | CLI, JSON, JUnit XML e SARIF |
| Semgrep | SAST | Código-fonte por padrões e análise semântica | SARIF, JSON e resultados incrementais |

## 11.1 Trivy

* **Descrição Acadêmica/Técnica:** O Trivy, desenvolvido em Go pela Aqua Security, é um *scanner* de segurança unificado e abrangente, projetado para consolidar múltiplas superfícies de análise (imagens de contêiner, sistemas de arquivos, repositórios Git e definições IaC) em uma única ferramenta de execução rápida. Em baixo nível, ao analisar uma imagem de contêiner, o Trivy realiza a extração e a inspeção das camadas (*layers*) do sistema de arquivos, identificando o gerenciador de pacotes do sistema operacional base (apt, apk, yum) e as dependências de linguagens de aplicação (package.json, requirements.txt, go.mod), correlacionando cada versão identificada contra múltiplos bancos de dados de vulnerabilidades (NVD, GitHub Security Advisories, distribuições Linux) mantidos em cache local para varreduras subsequentes de alta velocidade, sem exigir conectividade repetida com serviços externos.
* **Principais Funcionalidades:**
  * Varredura de vulnerabilidades (CVEs) em imagens de contêiner, analisando tanto o sistema operacional base quanto dependências de aplicação.
  * Detecção de segredos expostos (*secrets scanning*), como chaves de API e credenciais *hardcoded*, diretamente no código-fonte ou em camadas de imagens.
  * Auditoria de má configuração (*misconfiguration*) em arquivos de Infraestrutura como Código (Terraform, Kubernetes, Dockerfile, CloudFormation).
  * Geração de *Software Bill of Materials* (SBOM) estruturado, documentando exaustivamente todas as dependências de um artefato.
  * Saída em múltiplos formatos estruturados (JSON, SARIF, tabela), com suporte nativo a códigos de retorno (*exit codes*) configuráveis para interrupção automática de *pipelines*.

**Sintaxe e Comandos Principais:**

```bash
# Varredura de vulnerabilidades em uma imagem de contêiner, filtrando exclusivamente severidades críticas e altas

trivy image --severity CRITICAL,HIGH [nome_da_imagem:tag]

# Varredura de um sistema de arquivos local (ex: diretório de um projeto antes do build)

trivy fs [caminho_do_diretorio]

# Auditoria de má configuração em arquivos de Infraestrutura como Código

trivy config [caminho_do_diretorio_iac]

# Varredura com saída estruturada em JSON e código de retorno de falha (útil para gates de CI/CD)

trivy image --exit-code 1 --severity CRITICAL -f json -o [relatorio.json] [nome_da_imagem:tag]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Antes de publicar uma nova imagem de contêiner (api-pagamentos:v2.3) no registro de produção, a esteira de CI/CD precisa garantir automaticamente que a imagem não contenha vulnerabilidades críticas conhecidas em suas dependências de base ou de aplicação, interrompendo o *pipeline* imediatamente caso alguma seja encontrada.
- **Comando Executado:**

```bash
trivy image --exit-code 1 --severity CRITICAL,HIGH api-pagamentos:v2.3
```

- **Resultado Esperado:** O Trivy extrairá e analisará cada camada da imagem, exibindo uma tabela detalhada de vulnerabilidades encontradas (incluindo o pacote afetado, a versão instalada, a versão corrigida e o identificador CVE). Caso qualquer vulnerabilidade de severidade CRITICAL ou HIGH seja identificada, o comando retornará o código de saída 1, provocando a falha automática (*fail*) da etapa correspondente no *pipeline* de CI/CD e bloqueando a promoção da imagem vulnerável para produção.

## 11.2 Checkov

* **Descrição Acadêmica/Técnica:** O Checkov, desenvolvido em Python pela Bridgecrew (Palo Alto Networks), é uma ferramenta de análise estática (SAST) especializada exclusivamente na auditoria de Infraestrutura como Código (IaC). Em baixo nível, a ferramenta realiza o *parsing* sintático completo de arquivos de definição de infraestrutura (Terraform, CloudFormation, Kubernetes YAML, ARM Templates, Dockerfile), convertendo-os em uma representação de grafo abstrato de recursos e suas propriedades. Sobre essa representação estruturada, a ferramenta aplica centenas de políticas de segurança predefinidas (*policy-as-code*), verificando programaticamente violações de práticas recomendadas — como *buckets* de armazenamento configurados com acesso público, grupos de segurança de rede permitindo tráfego irrestrito (0.0.0.0/0) ou bancos de dados provisionados sem criptografia em repouso — antes que a infraestrutura seja de fato provisionada no ambiente de nuvem.
* **Principais Funcionalidades:**
  * Auditoria estática de centenas de políticas de segurança predefinidas para múltiplos provedores de IaC (Terraform, CloudFormation, Kubernetes, Helm, Dockerfile, ARM).
  * Detecção de segredos expostos (*hardcoded secrets*) diretamente em arquivos de configuração de infraestrutura.
  * Suporte à criação de políticas customizadas (*custom policies*) via Python ou uma linguagem declarativa (YAML) para regras específicas da organização.
  * Geração de relatórios de conformidade mapeados diretamente a frameworks regulatórios (CIS Benchmarks, PCI-DSS, SOC2, HIPAA).
  * Capacidade de suprimir (*skip*) violações específicas e justificadas diretamente no código através de comentários inline, mantendo rastreabilidade de exceções.

**Sintaxe e Comandos Principais:**

```bash
# Varredura completa de um diretório contendo arquivos de definição de infraestrutura (ex: Terraform)

checkov -d [caminho_do_diretorio]

# Varredura restrita a um único arquivo específico, com saída no formato JUnit (integrável em relatórios de CI)

checkov -f [caminho_do_arquivo.tf] -o junitxml

# Varredura ignorando explicitamente uma verificação específica pelo seu identificador

checkov -d [caminho_do_diretorio] --skip-check [ID_da_verificacao]

# Varredura filtrando exclusivamente por um framework de conformidade regulatório específico

checkov -d [caminho_do_diretorio] --framework terraform --compact
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Antes de aplicar (terraform apply) um novo módulo de infraestrutura que provisiona um *bucket* de armazenamento S3 e um banco de dados RDS na AWS, a equipe de DevSecOps precisa garantir automaticamente, dentro do *pipeline* de revisão de *Pull Requests*, que nenhum recurso seja provisionado com configurações de segurança inadequadas (ex: *bucket* público ou banco sem criptografia).
- **Comando Executado:**

```bash
checkov -d ./infraestrutura_terraform --compact
```

- **Resultado Esperado:** O Checkov analisará estaticamente todos os arquivos .tf do diretório, exibindo um resumo compacto indicando, por exemplo, a falha na verificação "CKV_AWS_18: Ensure the S3 bucket has access logging configured" e "CKV_AWS_16: Ensure that RDS instances have encryption enabled". Essas falhas, identificadas antes do provisionamento real, permitem que o desenvolvedor corrija o código Terraform diretamente no *Pull Request*, evitando a criação de infraestrutura vulnerável em produção.

## 11.3 Semgrep

* **Descrição Acadêmica/Técnica:** O Semgrep, desenvolvido em OCaml/Python pela Semgrep Inc. (anteriormente r2c), é uma ferramenta de análise estática de código-fonte (SAST) *multi-linguagem*, arquitetada para detectar padrões de vulnerabilidade e má prática de programação sem a necessidade de compilar o código analisado. Em baixo nível, a ferramenta realiza o *parsing* do código-fonte em uma Árvore de Sintaxe Abstrata (AST) genérica e independente de linguagem, sobre a qual aplica regras de correspondência de padrões (*pattern matching*) escritas em uma sintaxe declarativa YAML que se assemelha intencionalmente ao próprio código-fonte alvo, mas com suporte a metavariáveis (ex: $VAR) que capturam expressões arbitrárias. Essa abordagem permite que analistas de segurança escrevam regras customizadas de detecção (ex: identificar chamadas a funções de execução de comando concatenadas com entrada de usuário não sanitizada) com uma curva de aprendizado significativamente menor do que a exigida por ferramentas SAST tradicionais baseadas em análise de fluxo de dados complexa.
* **Principais Funcionalidades:**
  * Análise estática de código-fonte (SAST) suportando dezenas de linguagens de programação (Python, JavaScript, Go, Java, C, entre outras).
  * Motor de regras declarativo e legível (YAML), com suporte a metavariáveis para correspondência de padrões flexíveis.
  * Repositórios extensos de regras pré-construídas e mantidas pela comunidade (*Semgrep Registry*), mapeadas ao OWASP Top 10 e CWE.
  * Detecção de vulnerabilidades específicas de linguagem, como injeção de comandos, *deserialization* insegura e uso de funções criptográficas obsoletas.
  * Integração nativa e otimizada para execução incremental em *pipelines* de CI/CD, analisando exclusivamente os arquivos modificados em um *diff*.

**Sintaxe e Comandos Principais:**

```bash
# Varredura de um diretório utilizando um conjunto de regras pré-configurado da comunidade (ex: boas práticas OWASP)

semgrep --config p/owasp-top-ten [caminho_do_diretorio]

# Varredura utilizando um arquivo de regras customizado escrito pelo próprio analista

semgrep --config [caminho_regra_customizada.yaml] [caminho_do_diretorio]

# Varredura restrita exclusivamente aos arquivos alterados em relação a uma branch base (análise incremental)

semgrep --config auto --baseline-commit [hash_do_commit_base]

# Varredura com saída estruturada em formato SARIF, integrável a plataformas de gestão de vulnerabilidades

semgrep --config auto --sarif -o [relatorio.sarif] [caminho_do_diretorio]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Uma equipe de desenvolvimento precisa incorporar uma verificação automatizada de segurança de código diretamente no *Pull Request* de um repositório Python, detectando especificamente o uso perigoso da função eval() com entradas potencialmente controláveis pelo usuário, uma prática que introduz risco crítico de execução arbitrária de código.
- **Comando Executado:**

```bash
semgrep --config p/python --config p/owasp-top-ten ./src
```

- **Resultado Esperado:** O Semgrep percorrerá recursivamente o diretório ./src, e ao encontrar uma linha de código como eval(input_do_usuario), reportará uma descoberta (*finding*) indicando a regra violada (ex: python.lang.security.audit.eval-detected), a severidade (ERROR), o número exato da linha no arquivo e uma descrição educativa da vulnerabilidade, permitindo que o desenvolvedor corrija a falha antes mesmo da aprovação e *merge* do código na branch principal.

## 11.4 Pipeline integrado no GitHub Actions

O exemplo abaixo aplica as três camadas em um único *workflow*: Semgrep para o código, Checkov para IaC e Trivy para a imagem de contêiner. Cada etapa funciona como um *quality gate* independente.

```yaml
name: Security Pipeline

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Obter código
        uses: actions/checkout@v4

      - name: Analisar código com Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/python
            p/owasp-top-ten

      - name: Auditar IaC com Checkov
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: infraestrutura_terraform
          framework: terraform

      - name: Construir imagem
        run: docker build -t api-pagamentos:${{ github.sha }} .

      - name: Verificar imagem com Trivy
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: api-pagamentos:${{ github.sha }}
          severity: CRITICAL,HIGH
          exit-code: "1"
          ignore-unfixed: true
```

!!! note "Fixe versões e mantenha as ações atualizadas"
    Em ambientes corporativos, fixe ações por *commit SHA* revisado e use ferramentas de atualização automática, como Dependabot, para reduzir riscos na cadeia de suprimentos do próprio pipeline.
