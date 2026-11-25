## Resumo

<!-- O que este PR muda e por quê. Referencie issues com "Closes #123". -->

## Tipo de mudança

- [ ] `docs`: conteúdo do guia (novo capítulo, ferramenta, correção técnica)
- [ ] `fix`: correção de erro no site, link quebrado ou comando incorreto
- [ ] `feat`: melhoria no site (tema, navegação, recursos do MkDocs)
- [ ] `ci` / `build`: workflows, deploy ou dependências
- [ ] `chore`: manutenção sem mudança visível

## Como validar

<!-- Ex.: "mkdocs serve e abrir /08-criptoanalise-senhas/". -->

1.

## Checklist de segurança

<!-- Marque o que se aplica. Se algum item não se aplicar, marque e escreva "N/A" ao lado. -->

**Conteúdo do guia**
- [ ] Exemplos usam apenas alvos fictícios ou reservados: `example.com`, faixas de documentação (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) ou laboratórios próprios
- [ ] Nenhuma credencial, hash, token ou chave **real** aparece nos exemplos; valores fictícios estão claramente marcados
- [ ] Nenhum dado pessoal, IP real de terceiros ou saída de varredura de ambiente real
- [ ] Técnicas ofensivas ou comandos destrutivos têm aviso de uso **somente com autorização** e do risco envolvido
- [ ] Links externos apontam para fontes oficiais (site ou repositório do projeto) e foram conferidos

**Site e build**
- [ ] `mkdocs build --strict` passou localmente
- [ ] HTML/JS customizado (`overrides/`, `extra.css`, blocos HTML no Markdown) não carrega scripts de terceiros sem necessidade

**Dependências e CI**
- [ ] Novas dependências em `requirements.txt` estão fixadas em versão exata e vêm de fonte confiável
- [ ] Workflows novos ou alterados declaram `permissions:` mínimas e fixam actions pelo SHA completo, com a versão em comentário
- [ ] Nenhum uso de `pull_request_target` ou de `${{ github.event.* }}` interpolado diretamente em `run:`

**Geral**
- [ ] O hook de pre-commit (gitleaks) passou localmente
- [ ] Se este PR corrige uma vulnerabilidade, os detalhes **não** estão descritos publicamente (siga o `SECURITY.md`)
