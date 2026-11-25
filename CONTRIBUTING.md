# Como contribuir

Obrigado pelo interesse em melhorar o **Guia Cibersegurança**! Este documento descreve como propor correções e conteúdo novo, e as regras de segurança e ética que valem para todas as contribuições.

> **Encontrou uma vulnerabilidade no site, nos workflows ou nas dependências?** Não abra issue nem PR público. Siga o [SECURITY.md](SECURITY.md).

## Antes de começar

1. Procure uma issue existente ou abra uma nova usando os formulários disponíveis: erro no conteúdo, problema no site ou sugestão de conteúdo.
2. Para capítulos ou seções novas, alinhe a proposta na issue antes de escrever.

## Ambiente local

Pré-requisitos: Python 3.9+ e Git.

```bash
git clone https://github.com/PedroAHB/guia-ciberseguranca.git
cd guia-ciberseguranca

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Hooks de pre-commit (obrigatório)
pip install pre-commit
pre-commit install

mkdocs serve                       # http://127.0.0.1:8000
```

Antes de abrir o PR, confirme que o build passa sem avisos:

```bash
mkdocs build --strict
```

O hook do [gitleaks](https://github.com/gitleaks/gitleaks) roda em todo commit e bloqueia segredos detectados. **Não use `git commit --no-verify`** para contorná-lo. Se for um falso positivo num exemplo didático, veja a seção [Exemplos e dados fictícios](#exemplos-e-dados-ficticios).

## Estrutura

| Caminho | Conteúdo |
| ------- | -------- |
| `docs/NN-*.md` | Capítulos do guia, na ordem do ciclo de vida do pentest |
| `docs/assets/` | Imagens e CSS |
| `overrides/` | Templates customizados do tema Material |
| `mkdocs.yml` | Configuração do site e navegação (`nav:`) |

Ao criar uma página nova, adicione-a ao `nav:` do `mkdocs.yml`.

## Padrões de conteúdo

- Siga a estrutura de cabeçalhos e o formato dos blocos de comando já usados nos capítulos.
- Informe a **versão da ferramenta** sobre a qual o conteúdo foi escrito.
- Cite a **fonte oficial** (documentação, man page ou repositório do projeto) para comandos e parâmetros.
- Escreva em português, mantendo termos técnicos consagrados em inglês em *itálico*.

## Ética e segurança do conteúdo

### Uso autorizado
- Toda técnica ofensiva deve vir acompanhada de aviso de que só pode ser aplicada em ambientes próprios, laboratórios ou com **autorização formal por escrito**.
- Comandos destrutivos ou que possam causar indisponibilidade (DoS, *fuzzing* agressivo, alteração de dados) devem trazer aviso explícito do risco.
- Não serão aceitos conteúdos voltados a atacar alvos específicos reais, nem *malware* funcional ou *payloads* armados além do necessário para fins didáticos.

### Exemplos e dados fictícios
- Use apenas alvos fictícios ou reservados para documentação:
  - domínios: `example.com`, `example.org`, `*.example`
  - IPv4: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` (RFC 5737)
  - IPv6: `2001:db8::/32` (RFC 3849)
  - ambientes de laboratório próprios ou intencionalmente vulneráveis (DVWA, Metasploitable, HTB/THM etc.)
- **Nunca** inclua saídas de varreduras de ambientes reais, IPs ou domínios de terceiros, dados pessoais, hashes quebrados ou credenciais reais, nem mesmo de laboratório.
- Valores de exemplo de tokens e chaves devem ser obviamente fictícios (`AKIAIOSFODNN7EXAMPLE`, `xxxx-xxxx`). Se o gitleaks barrar um exemplo legítimo, adicione o comentário `gitleaks:allow` à linha e justifique no PR.

### Segredos
- Este projeto **não precisa de segredos** para build ou deploy: o workflow usa apenas o `GITHUB_TOKEN`.
- Se um segredo for commitado por engano, **considere-o comprometido**: revogue-o imediatamente e avise o mantenedor. Apagar o arquivo num commit novo não o remove do histórico.

## Fluxo de trabalho

1. Crie uma branch a partir da `main` atualizada:
   ```bash
   git switch main && git pull --ff-only
   git switch -c <tipo>/<descricao-curta>
   ```
2. Mantenha cada PR pequeno e focado em **um único assunto**.
3. Abra o PR para a `main` e preencha o template, incluindo o **checklist de segurança**.
4. O merge é feito pelo mantenedor. Cada merge na `main` publica o site automaticamente no GitHub Pages.

## Padrão de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

| Tipo | Uso |
| ---- | --- |
| `docs` | Conteúdo do guia e documentação |
| `fix` | Correção de erro no site, link ou comando |
| `feat` | Melhoria no site (tema, navegação, recursos) |
| `ci` | Workflows |
| `build` | Dependências e build |
| `chore` | Manutenção sem mudança visível |

Para registrar coautoria, adicione ao final da mensagem, após uma linha em branco:

```
Co-authored-by: Nome <email>
```

## Dependências e GitHub Actions

- Dependências em `requirements.txt` ficam fixadas em versão exata (`==`). Atualize uma por PR.
- Workflows declaram `permissions:` mínimas e fixam actions pelo **SHA completo**, com a versão em comentário.
- Evite `pull_request_target` e não interpole `${{ github.event.* }}` diretamente em `run:`.

## Licença

Ao contribuir, você concorda que o conteúdo textual enviado seja licenciado sob a mesma licença do projeto, [CC BY 4.0](LICENSE). Não envie material de terceiros (textos, imagens, diagramas) sem permissão ou licença compatível.
