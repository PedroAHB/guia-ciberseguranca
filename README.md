![Guia Cibersegurança — by Pedro Hackner](docs/assets/img/capa.webp)

# Guia Cibersegurança

[![Deploy MkDocs](https://github.com/PedroAHB/guia-ciberseguranca/actions/workflows/deploy.yml/badge.svg)](https://github.com/PedroAHB/guia-ciberseguranca/actions/workflows/deploy.yml)
[![Licença: CC BY 4.0](https://img.shields.io/badge/Licen%C3%A7a-CC%20BY%204.0-lightgrey.svg)](LICENSE)

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

Pré-requisitos: Python 3.9+.

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
mkdocs serve
```

Depois, acesse `http://127.0.0.1:8000` no navegador. Qualquer alteração nos arquivos em `docs/` é recarregada automaticamente.

## Publicação

O site é gerado com [MkDocs](https://www.mkdocs.org/) + [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) e publicado automaticamente no GitHub Pages a cada `push` na branch `main`, através do workflow em [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Aviso legal

Todas as ferramentas, técnicas e metodologias documentadas neste guia possuem propósito estritamente educacional, técnico e profissional, devendo ser aplicadas exclusivamente em ambientes controlados, laboratórios próprios ou engajamentos formalmente autorizados por escrito (*Rules of Engagement*), em conformidade com a legislação vigente.

## Licença

O conteúdo textual original está disponível sob a licença [Creative Commons Attribution 4.0 International](LICENSE). Materiais de terceiros permanecem sujeitos aos direitos de seus respectivos titulares.

## Autor

Pedro Augusto Hackner Bittencourt

![Utilize esse guia com sabedoria e apenas em ambientes controlados](docs/assets/img/aviso.webp)
