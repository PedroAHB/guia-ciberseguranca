# Política de Segurança

## Versões suportadas

Este repositório publica um site estático (MkDocs) a partir da branch `main`. Apenas a versão atual recebe correções.

| Versão | Suportada |
| ------ | --------- |
| Branch `main` e site publicado em <https://PedroAHB.github.io/guia-ciberseguranca/> | ✅ |
| Commits antigos, forks e cópias do site | ❌ |

## O que reportar por aqui

- Vulnerabilidades no site publicado (por exemplo, XSS em páginas ou templates customizados em `overrides/`).
- Problemas nos workflows do GitHub Actions ou na cadeia de dependências (`requirements.txt`) que permitam comprometer o build ou o deploy.
- Segredos ou dados pessoais expostos no repositório ou no site.
- Conteúdo do guia que, se seguido como está, exponha o leitor a um risco não sinalizado, como um link malicioso ou comprometido, ou um comando destrutivo sem aviso.

Erros técnicos comuns no conteúdo, como um comando desatualizado ou um parâmetro incorreto, devem ser reportados por **issue pública** normal.

## Como reportar uma vulnerabilidade

**Não abra uma issue, discussão ou pull request público para relatar uma vulnerabilidade.**

1. **Canal preferencial:** use o [reporte privado de vulnerabilidades do GitHub](https://docs.github.com/pt/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability), na aba **Security** do repositório, botão **Report a vulnerability**.
2. **Se o botão não estiver disponível:** abra uma issue com o título `Contato de segurança` **sem nenhum detalhe técnico** e peça um canal privado. O mantenedor (@PedroAHB) responderá com as instruções.

### O que incluir no relato

- Descrição da vulnerabilidade e do impacto esperado
- Passos para reproduzir ou prova de conceito
- URL, arquivo, workflow ou commit afetado
- Sugestão de correção ou mitigação, se houver

Nunca envie segredos reais (tokens, senhas, chaves) no relato. Se encontrar um segredo exposto, informe apenas onde ele está.

## O que esperar

| Etapa | Prazo-alvo |
| ----- | ---------- |
| Confirmação de recebimento | até 5 dias úteis |
| Avaliação inicial e classificação de severidade | até 10 dias úteis |
| Correção ou plano de mitigação | conforme a severidade, informado na avaliação |

Pedimos que a vulnerabilidade não seja divulgada publicamente até que uma correção esteja disponível ou até 90 dias após o relato, o que ocorrer primeiro. Com a sua autorização, daremos crédito pela descoberta.

## Fora do escopo

- Vulnerabilidades nas **ferramentas descritas no guia** (Nmap, Metasploit, Burp Suite etc.). Reporte diretamente aos respectivos projetos.
- Vulnerabilidades da infraestrutura do GitHub ou do GitHub Pages. Reporte ao [programa de bug bounty do GitHub](https://bounty.github.com/).
- Ataques de negação de serviço, engenharia social e varreduras automatizadas sem impacto demonstrado.

## Uso responsável do conteúdo

As técnicas descritas neste guia destinam-se exclusivamente a ambientes próprios, laboratórios ou auditorias com **autorização formal**. Este repositório não oferece suporte a uso não autorizado.
