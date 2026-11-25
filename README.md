![Guia Cibersegurança — by Pedro Hackner](docs/assets/img/capa.webp)

# Guia Cibersegurança

[![Deploy MkDocs](https://github.com/PedroAHB/guia-ciberseguranca/actions/workflows/deploy.yml/badge.svg)](https://github.com/PedroAHB/guia-ciberseguranca/actions/workflows/deploy.yml)
[![Licença: CC BY 4.0](https://img.shields.io/badge/Licen%C3%A7a-CC%20BY%204.0-lightgrey.svg)](LICENSE)
[![CodeQL](https://github.com/PedroAHB/guia-ciberseguranca/actions/workflows/codeql.yml/badge.svg)](https://github.com/PedroAHB/guia-ciberseguranca/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/PedroAHB/guia-ciberseguranca/badge)](https://scorecard.dev/viewer/?uri=github.com/PedroAHB/guia-ciberseguranca)

Guia técnico e acadêmico para a exploração sistemática do ecossistema Kali Linux, documentando de forma estruturada e progressiva o ferramental aplicado em auditorias de cibersegurança, gestão de infraestrutura de TI e integração de práticas DevSecOps.

Fundamentado em metodologias padrão da indústria, como o *Penetration Testing Execution Standard* (PTES) e a *Cyber Kill Chain*, o guia categoriza as ferramentas em conformidade com o ciclo de vida do *pentest* — evoluindo do mapeamento inicial da superfície de ataque (OSINT) até a automação contínua de segurança em *pipelines* CI/CD.

**Site publicado:** https://PedroAHB.github.io/guia-ciberseguranca/

## Estrutura do conteúdo

O guia é dividido em 11 capítulos, cada um cobrindo uma fase do ciclo de vida do pentest:

1. Reconhecimento Passivo e OSINT
2. Enumeração Ativa e Mapeamento de Rede
3. Análise de Vulnerabilidades
4. Segurança de Aplicações Web e APIs
5. Exploração de Serviços e Bancos de Dados
6. Pós-Exploração e Escalonamento de Privilégios
7. Movimentação Lateral e Persistência
8. Criptoanálise e Quebra de Senhas
9. Auditoria de Redes Sem Fio (Wireless/RF)
10. Engenharia Reversa e Análise de Malware
11. DevSecOps e Automação de Segurança

## Rodando o site localmente

Pré-requisitos: Python 3.11+ (exigido pelo `mkdocs-material` 9.8 e pelo `pymdown-extensions` 13.x).

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
mkdocs serve
```

Depois, acesse `http://127.0.0.1:8000` no navegador. Qualquer alteração nos arquivos em `docs/` é recarregada automaticamente.

## Setup seguro

### Ambiente isolado e dependências fixadas

- Use sempre um ambiente virtual (`.venv/`, já ignorado pelo git) para não misturar as dependências do site com as do sistema ou do Kali.
- As versões em `requirements.txt` são fixadas com `==`, de modo que todos (incluindo o deploy) constroem o site com exatamente as mesmas versões. Atualizações chegam por PRs do Dependabot.

### Hooks de pre-commit

```bash
pip install pre-commit
pre-commit install
```

O [gitleaks](https://github.com/gitleaks/gitleaks) roda em todo commit e bloqueia segredos colados por engano. Não use `--no-verify` para contorná-lo.

### Segredos

- **O projeto não precisa de nenhum segredo.** O build é local e o deploy usa apenas o `GITHUB_TOKEN` temporário do GitHub Actions, com permissão de escrita restrita ao job de deploy.
- Não crie arquivos `.env`, chaves ou tokens no repositório. Se algum dia um segredo for necessário no CI, use [GitHub Secrets](https://docs.github.com/pt/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) e prefira OIDC a chaves de longa duração.

### Artefatos de laboratório

Ao praticar os capítulos, **não salve dentro do repositório** capturas de rede, potfiles, saídas de varredura ou dumps: eles podem conter dados reais. O `.gitignore` cobre os formatos mais comuns (`*.pcap*`, `*.potfile`, `*.gnmap`, `loot/`, `scans/` etc.), mas o ideal é manter esses arquivos fora do diretório do projeto.

### Se um segredo ou dado sensível vazar

1. **Revogue ou rotacione** a credencial imediatamente no provedor. Apagar o arquivo num commit novo não o remove do histórico, e repositórios públicos são varridos por bots em minutos.
2. Avise o mantenedor pelo canal privado descrito no [SECURITY.md](SECURITY.md).
3. Só depois avalie reescrever o histórico do git.

Mais detalhes em [CONTRIBUTING.md](CONTRIBUTING.md).

## Publicação

O site é gerado com [MkDocs](https://www.mkdocs.org/) + [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) e publicado automaticamente no GitHub Pages a cada `push` na branch `main`, através do workflow em [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Aviso legal

Todas as ferramentas, técnicas e metodologias documentadas neste guia possuem propósito estritamente educacional, técnico e profissional, devendo ser aplicadas exclusivamente em ambientes controlados, laboratórios próprios ou engajamentos formalmente autorizados por escrito (*Rules of Engagement*), em conformidade com a legislação vigente.

## Licença

O conteúdo textual original está disponível sob a licença [Creative Commons Attribution 4.0 International](LICENSE). Materiais de terceiros permanecem sujeitos aos direitos de seus respectivos titulares.

## Autor

Pedro Augusto Hackner Bittencourt

![Utilize esse guia com sabedoria e apenas em ambientes controlados](docs/assets/img/aviso.webp)
