---
description: "Ferramentas para análise dinâmica, fuzzing e exploração ética de aplicações web e APIs."
---

# 4. Segurança de Aplicações Web e APIs

Diferente das fases anteriores, voltadas à infraestrutura e rede, esta seção opera exclusivamente na Camada 7 do modelo OSI. O objetivo tático é a análise dinâmica (DAST) e a exploração lógica da aplicação para identificar vulnerabilidades inerentes ao código (como mapeadas pelo *OWASP Top 10*), incluindo injeções (SQLi, XSS), falhas de controle de acesso, SSRF e quebras de autenticação.

!!! warning "Proteja dados e ambientes produtivos"
    Testes ativos podem alterar dados, disparar transações e degradar aplicações. Prefira ambientes de homologação, use contas dedicadas e registre limites claros para ataques automatizados.

| Ferramenta | Abordagem | Melhor aplicação | Automação |
| --- | --- | --- | --- |
| Burp Suite | Proxy e testes manuais/assistidos | Validação lógica e manipulação fina de requisições | Parcial; recursos avançados dependem da edição |
| OWASP ZAP | Proxy e DAST aberto | Varredura automatizada em esteiras CI/CD | Alta, com CLI, API e Automation Framework |
| SQLmap | Exploração especializada de SQLi | Confirmação e enumeração controlada de injeções SQL | Alta, orientada a parâmetros/requisições |
| ffuf | *Fuzzing* HTTP | Descoberta de conteúdo, parâmetros e *virtual hosts* | Alta, com filtros e saída estruturada |

## 4.1 Burp Suite — v2026.7

* **Descrição Acadêmica/Técnica:** Desenvolvido pela PortSwigger em Java, o Burp Suite é uma plataforma integrada para testes de segurança em aplicações web, arquitetada em torno de um *proxy* de interceptação *man-in-the-middle* (MITM) que se posiciona entre o navegador do analista e o servidor alvo. Em baixo nível, ele termina a sessão TLS do cliente e estabelece uma nova conexão criptografada com o destino, utilizando um certificado raiz próprio (CA *self-signed*) instalado no navegador para descriptografar e permitir a manipulação em tempo real de requisições e respostas HTTP/HTTPS antes da retransmissão. Sobre essa camada de interceptação, a suíte agrega múltiplos módulos especializados (Repeater, Intruder, Scanner, Sequencer, Decoder), permitindo desde a manipulação manual granular de parâmetros até a automação de ataques de força bruta e a varredura ativa/passiva de vulnerabilidades lógicas.
* **Principais Funcionalidades:**
  * Interceptação, suspensão e edição manual de requisições/respostas HTTP em trânsito (módulo *Proxy*).
  * Reenvio manual e iterativo de requisições isoladas para análise de comportamento da aplicação (módulo *Repeater*).
  * Automação de ataques de fuzzing e força bruta com múltiplos motores de payload e pontos de inserção customizáveis (módulo *Intruder*).
  * Motor de varredura automatizada (DAST) para detecção de vulnerabilidades como SQLi, XSS e *command injection* (módulo *Scanner*, restrito à versão *Professional*).
  * Extensibilidade via *BApp Store* e API em Java/Python (Jython) para desenvolvimento de extensões customizadas.

**Sintaxe e Comandos Principais:** Sendo uma aplicação primariamente gráfica em Java, a interação via terminal no Kali Linux restringe-se à inicialização do processo e à configuração do ambiente:

```bash
# Inicialização padrão da interface gráfica (versão Community ou Professional)

burpsuite

# Inicialização em modo headless (sem GUI), útil para varreduras automatizadas via linha de comando na versão Professional

java -jar [caminho_burpsuite_pro.jar] --project-file=[projeto.burp] --config-file=[config.json] --unpause-spider-and-scanner
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Durante uma auditoria de segurança em uma aplicação de *e-commerce*, o analista precisa validar se o fluxo de checkout é vulnerável a manipulação de preços (*price tampering*) ou a *Insecure Direct Object References* (IDOR), alterando o identificador de pedido de outro cliente para visualizar dados sensíveis não autorizados.
- **Execução Prática:** O analista configura o navegador para rotear o tráfego pelo *proxy* local (127.0.0.1:8080) do Burp Suite e realiza a navegação normal pela loja até a etapa de finalização de compra. A requisição de confirmação do pedido é capturada na aba *Proxy*, enviada ao *Repeater* (Ctrl+R), e o parâmetro order_id é manualmente alterado para o valor de um pedido pertencente a outro usuário.
- **Resultado Esperado:** Caso a aplicação não valide corretamente a propriedade do recurso (falha de *Broken Access Control*), o servidor retornará o código HTTP 200 juntamente com os dados completos do pedido de terceiros (endereço, itens e valores), confirmando a vulnerabilidade de IDOR para inclusão imediata no relatório de risco crítico.

## 4.2 OWASP ZAP (Zed Attack Proxy) — v2.17.0

* **Descrição Acadêmica/Técnica:** O OWASP ZAP é um *proxy* de interceptação e *scanner* de vulnerabilidades de código aberto, desenvolvido em Java sob a governança da fundação OWASP, arquitetado como alternativa livre e totalmente automatizável ao Burp Suite. Em baixo nível, sua operação central também se baseia em um *proxy* MITM com certificado raiz próprio, porém sua arquitetura é fundamentalmente orientada à automação: o ZAP expõe uma API REST completa e um motor de *scripting* (Zest, Python, JavaScript) que permite orquestrar rastreamentos (*spidering*), varreduras ativas e passivas inteiramente via linha de comando ou *pipelines* de CI/CD, sem dependência estrita da interface gráfica. O *Ajax Spider*, baseado no motor de navegação Selenium/HtmlUnit, complementa o rastreamento tradicional ao renderizar e interagir com aplicações que dependem intensamente de JavaScript (*Single Page Applications*).
* **Principais Funcionalidades:**
  * Rastreamento automatizado de aplicações web tradicionais (*Traditional Spider*) e SPAs renderizadas em JavaScript (*Ajax Spider*).
  * Motor de varredura passiva (análise não intrusiva de respostas) e ativa (envio de *payloads* de ataque) para detecção de falhas do *OWASP Top 10*.
  * API REST nativa completa para orquestração integral de varreduras em *pipelines* DevSecOps sem interação manual.
  * Modo *Automation Framework* baseado em arquivos YAML declarativos para definição reprodutível de planos de varredura.
  * Suporte a autenticação complexa (formulários, *scripts*, tokens JWT/OAuth) para varreduras autenticadas em áreas restritas da aplicação.

**Sintaxe e Comandos Principais:**

```bash
# Inicialização da interface gráfica padrão

zaproxy

# Varredura rápida e automatizada via linha de comando (modo headless), com relatório em HTML

zap.sh -cmd -quickurl [https://alvo.com] -quickout [relatorio_zap.html]

# Execução de um plano declarativo via Automation Framework (YAML), integrável em esteiras CI/CD

zap.sh -cmd -autorun [plano_automacao.yaml]

# Inicialização em modo daemon expondo a API REST para orquestração remota

zap.sh -daemon -host 0.0.0.0 -port 8090 -config api.key=[chave_api]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Uma equipe de DevSecOps precisa incorporar uma verificação de segurança dinâmica (DAST) automatizada ao *pipeline* de integração contínua, garantindo que nenhuma *build* seja promovida ao ambiente de produção caso vulnerabilidades de severidade alta sejam introduzidas na aplicação (https://staging.alvo.com), sem exigir intervenção manual de um analista.
- **Comando Executado:**

```bash
zap.sh -cmd -quickurl https://staging.alvo.com -quickprogress -quickout relatorio_zap_staging.xml
```

- **Resultado Esperado:** O ZAP executará em modo *headless* o rastreamento completo da aplicação seguido da varredura ativa padrão, exibindo o progresso percentual em tempo real no terminal (-quickprogress). Ao término, o relatório estruturado em XML será gerado, permitindo que um *script* subsequente na esteira de CI/CD analise a severidade dos achados e determine automaticamente a aprovação ou reprovação (*fail the build*) do *deploy*.

## 4.3 SQLmap — v1.10.6

* **Descrição Acadêmica/Técnica:** O SQLmap é uma ferramenta de exploração automatizada de injeção SQL (SQLi), desenvolvida em Python, projetada para detectar e explorar falhas de sanitização de entrada em camadas de persistência de dados. Em baixo nível, o motor opera através de um extenso conjunto de técnicas de inferência: *Boolean-based blind*, *Error-based*, *UNION query-based*, *Stacked queries* e *Time-based blind*, testando sistematicamente a resposta da aplicação a payloads booleanos e temporizados quando não há retorno direto de dados na tela. Uma vez confirmado o vetor de injeção, a ferramenta é capaz de impressão digital do SGBD (*fingerprinting* via banners e comportamento de funções nativas), enumeração de metadados (bancos, tabelas, colunas) através de consultas SQL cegas reconstruídas byte a byte, e, dependendo dos privilégios do usuário do banco, escalonamento para execução de comandos no sistema operacional subjacente via funcionalidades nativas do SGBD (ex: xp_cmdshell no MSSQL).
* **Principais Funcionalidades:**
  * Detecção automatizada de múltiplos tipos de injeção SQL (*Boolean, Error, Union, Stacked, Time-based*) em parâmetros GET, POST, *headers* e *cookies*.
  * Suporte nativo a mais de uma dezena de Sistemas Gerenciadores de Banco de Dados (MySQL, PostgreSQL, MSSQL, Oracle, SQLite, entre outros).
  * Enumeração completa de metadados do banco (bancos de dados, tabelas, colunas, usuários e privilégios) e extração (*dump*) de dados sensíveis.
  * Técnicas de evasão de *Web Application Firewalls* (WAF/IPS) via *scripts* de manipulação (*tamper scripts*).
  * Capacidade de escalonamento para acesso ao sistema de arquivos (leitura/escrita) e execução de comandos no sistema operacional hospedeiro do SGBD.

**Sintaxe e Comandos Principais:**

```bash
# Teste e identificação inicial de injeção em um parâmetro de URL específico

sqlmap -u [http://alvo.com/pagina.php?id=1]

# Varredura a partir de uma requisição HTTP bruta capturada (ex: exportada do Burp Suite), incluindo cookies de sessão

sqlmap -r [requisicao.txt] --batch

# Enumeração de bancos de dados e tabelas após confirmação da injeção

sqlmap -u [http://alvo.com/pagina.php?id=1] --dbs

sqlmap -u [http://alvo.com/pagina.php?id=1] -D [nome_do_banco] --tables

# Extração completa (dump) de uma tabela específica com aplicação de scripts de evasão de WAF

sqlmap -u [http://alvo.com/pagina.php?id=1] -D [banco] -T [tabela] --dump --tamper=space2comment
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Durante a auditoria de uma aplicação de portal de notícias, o analista identifica que o parâmetro id na URL de exibição de artigos (http://alvo.com/noticia.php?id=15) retorna comportamentos distintos ao ser manipulado com aspas simples, sugerindo uma potencial injeção SQL cega (*blind*). O objetivo é confirmar a falha e extrair a tabela de credenciais administrativas sem interromper a disponibilidade do serviço.
- **Comandos Executados:**

```bash
sqlmap -u "http://alvo.com/noticia.php?id=15" --batch --dbs

sqlmap -u "http://alvo.com/noticia.php?id=15" -D portal_noticias -T usuarios_admin --dump
```

- **Resultado Esperado:** O SQLmap primeiramente confirmará o vetor de injeção (provavelmente do tipo *Time-based blind*), identificará o SGBD como MySQL e listará os bancos de dados disponíveis no servidor. Na segunda execução, a ferramenta reconstruirá byte a byte o conteúdo da tabela usuarios_admin, exibindo em formato tabular no terminal os hashes de senha e nomes de usuário administrativos, prontos para uma tentativa subsequente de quebra offline via [Hashcat](08-criptoanalise-senhas.md#81-hashcat) ou [John the Ripper](08-criptoanalise-senhas.md#82-john-the-ripper).

## 4.4 ffuf (Fuzz Faster U Fool) — v2.2.1

* **Descrição Acadêmica/Técnica:** O ffuf é uma ferramenta de *fuzzing* web de alto desempenho, escrita em linguagem Go, projetada para a descoberta de conteúdo e a manipulação sistemática de qualquer ponto de uma requisição HTTP através da substituição de uma palavra-chave (FUZZ) por entradas provenientes de uma *wordlist*. Em baixo nível, sua arquitetura aproveita a concorrência nativa do Go (*goroutines*) para disparar um volume massivo de requisições HTTP simultâneas, avaliando as respostas com base em filtros granulares de código de status, tamanho de resposta, contagem de palavras/linhas ou tempo de resposta, permitindo isolar resultados relevantes mesmo em aplicações que retornam página 200 genérica para recursos inexistentes (*soft 404s*). Sua flexibilidade de posicionamento do marcador FUZZ permite aplicá-lo não apenas a diretórios de URL, mas também a parâmetros, *headers*, valores de *cookies* e sub-domínios (*virtual host fuzzing*).
* **Principais Funcionalidades:**
  * Descoberta de diretórios, arquivos e *endpoints* de API ocultos através de substituição posicional do marcador FUZZ.
  * *Fuzzing* de sub-domínios (via manipulação do cabeçalho Host) e de parâmetros GET/POST para identificação de entradas ocultas.
  * Filtragem e correspondência granular de resultados por código HTTP, tamanho de resposta, contagem de palavras/linhas e latência (-fc, -fs, -mc, -ms).
  * Suporte a múltiplas *wordlists* simultâneas com marcadores distintos, permitindo combinações complexas (ex: FUZZ1/FUZZ2).
  * Controle refinado de concorrência (*threads*), *rate limiting* e recursividade automática em diretórios descobertos.

**Sintaxe e Comandos Principais:**

```bash
# Descoberta básica de diretórios e arquivos utilizando uma wordlist padrão

ffuf -w [wordlist.txt] -u [http://alvo.com/FUZZ]

# Fuzzing de subdomínios via manipulação do cabeçalho Host, filtrando por tamanho de resposta

ffuf -w [subdominios.txt] -u [https://alvo.com] -H "Host: FUZZ.alvo.com" -fs [tamanho_a_ignorar]

# Fuzzing de parâmetros em uma requisição POST, ocultando respostas com código 404

ffuf -w [parametros.txt] -u [http://alvo.com/login] -X POST -d "FUZZ=teste" -H "Content-Type: application/x-www-form-urlencoded" -fc 404

# Descoberta recursiva de diretórios com extensões específicas e múltiplas threads

ffuf -w [wordlist.txt] -u [http://alvo.com/FUZZ] -e .php,.bak,.zip -recursion -t 100
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após identificar que uma aplicação retorna sistematicamente o código HTTP 200 com um corpo de resposta idêntico (tamanho fixo de 3.245 bytes) para qualquer recurso inexistente (*soft 404*), o analista precisa localizar painéis administrativos e arquivos de backup ocultos em http://alvo.com sem que os falsos positivos poluam a saída.
- **Comando Executado:**

```bash
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://alvo.com/FUZZ -e .php,.bak -fs 3245 -t 80 -o resultado_ffuf.json -of json
```

- **Resultado Esperado:** O ffuf disparará requisições concorrentes (80 *threads*) testando cada entrada da *wordlist* com e sem as extensões especificadas, filtrando ativamente qualquer resposta cujo tamanho seja exatamente 3.245 bytes (o padrão do *soft 404*). O terminal exibirá apenas as ocorrências anômalas e legítimas (ex: /admin.php retornando 200 com tamanho de resposta distinto, ou /backup.zip retornando 403), com os resultados estruturados persistidos no arquivo resultado_ffuf.json para posterior análise e inclusão no relatório técnico.
