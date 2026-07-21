---
description: "Ferramentas para identificar, validar e priorizar vulnerabilidades em infraestruturas e aplicações."
---

# 3. Análise de Vulnerabilidades

Nesta fase do ciclo de auditoria, o foco transita do [mapeamento topológico realizado na fase anterior](02-enumeracao-mapeamento-rede.md) para a identificação ativa e triagem de falhas de segurança. O objetivo é correlacionar os serviços e versões descobertos com bancos de dados de vulnerabilidades conhecidas (CVEs), além de auditar configurações sistêmicas (*misconfigurations*) e credenciais padrão.

## 3.1 Nuclei

* **Descrição Acadêmica/Técnica:** Desenvolvido em linguagem Go pela ProjectDiscovery, o Nuclei é um motor de varredura de vulnerabilidades arquitetado sobre um modelo de execução declarativo baseado em *templates* YAML. Diferente de *scanners* tradicionais que operam primariamente via *banner grabbing* ou heurísticas fechadas, o Nuclei executa requisições HTTP, TCP, DNS e SSL exatas e customizadas, analisando as respostas contra padrões de expressões regulares (RegEx) ou *matchers* lógicos definidos pela comunidade. Essa abordagem de baixo nível (enviando o *payload* exato da exploração) reduz drasticamente a taxa de falsos positivos. Devido à sua altíssima concorrência e capacidade de saída em formatos estruturados (JSON), é amplamente adotado em *pipelines* de Integração e Entrega Contínuas (CI/CD) para testes de regressão de segurança.
* **Principais Funcionalidades:**
  * Execução massiva e concorrente de verificações de segurança em múltiplos alvos simultaneamente.
  * Motor de *templates* flexível (YAML) que permite a rápida tradução de *Proof of Concepts* (PoCs) de novas CVEs em automações de detecção.
  * Suporte a múltiplos protocolos (TCP, HTTP, DNS, SSL, File, Whois, entre outros).
  * Filtros granulares de execução baseados em *tags*, severidade, autores ou diretórios específicos.

* **Sintaxe e Comandos Principais:**

```bash
# Atualização do motor de templates oficial da comunidade (recomendado antes de qualquer uso)

nuclei -ut

# Varredura básica de um único alvo utilizando todos os templates padrão

nuclei -u [https://alvo.com]

# Varredura massiva a partir de um arquivo de IPs/Domínios exportando os resultados para JSON

nuclei -l [hosts.txt] -json-export [resultados.json]

# Varredura focada estritamente em vulnerabilidades críticas e altas (CVEs e exposições)

nuclei -u [alvo.com] -tags cve,exposure -severity critical,high
```

**Exemplo Prático de Aplicação:**
- **Cenário:** No contexto de uma esteira DevSecOps, um novo *deploy* de uma aplicação web (*release candidate*) acaba de ser provisionado no ambiente de *staging* ([https://staging.alvo.com](https://staging.alvo.com)). Antes de promover o código para produção, o analista automatiza o Nuclei no *pipeline* para garantir que não haja arquivos de ambiente expostos (como .env ou .git) e que a aplicação não esteja vulnerável a falhas críticas recém-descobertas.
- **Comando Executado:**

```bash
nuclei -u https://staging.alvo.com -tags config,cve -severity critical,high,medium -o relatorio_nuclei_staging.txt
```

- **Resultado Esperado:** O Nuclei compilará os *templates* que correspondam às *tags* e severidades solicitadas e disparará requisições simultâneas contra o ambiente de *staging*. Caso encontre, por exemplo, um diretório .git exposto ou um painel de administração vulnerável a uma CVE específica, a correspondência será validada (evitando falsos positivos) e registrada no arquivo relatorio_nuclei_staging.txt, podendo acionar o bloqueio automático do *deploy* na esteira de CI/CD.

## 3.2 Nessus

* **Descrição Acadêmica/Técnica:** O Nessus, desenvolvido pela Tenable, é uma solução proprietária de varredura de vulnerabilidades amplamente consolidada como padrão na indústria corporativa. Em baixo nível, opera de forma arquiteturalmente análoga ao OpenVAS (que derivou de seu código *open-source* original), utilizando um motor que executa dezenas de milhares de *plugins* compilados, escritos na linguagem NASL (*Nessus Attack Scripting Language*). Sua distinção técnica principal reside na curadoria estrita e na telemetria global de suas assinaturas, o que lhe confere um índice de falsos positivos significativamente menor que as alternativas gratuitas. A ferramenta é projetada não apenas para inferência probabilística de CVEs via rede, mas fundamentalmente para a auditoria determinística do estado interno do sistema operacional.
* **Principais Funcionalidades:**
  * Execução de varreduras autenticadas (*Credentialed Scans*) de altíssima precisão no registro do Windows e sistemas de arquivos Linux.
  * Auditoria nativa de conformidade baseada em *benchmarks* rigorosos (CIS, DISA STIG, HIPAA, PCI-DSS).
  * Avaliação de segurança em dispositivos de infraestrutura de rede (switches, roteadores Cisco/Juniper) e *appliances* de segurança.
  * Geração de relatórios executivos com priorização baseada em risco (*Vulnerability Priority Rating* - VPR).
* **Sintaxe e Comandos Principais:** Sendo uma plataforma *Enterprise* cuja operação interativa ocorre primariamente através de sua interface gráfica (GUI), a interação via terminal no Kali Linux restringe-se ao controle do *daemon* e manutenção do *backend*:

```bash
# Inicialização do daemon do Nessus (acesso padrão: https://127.0.0.1:8834)

sudo systemctl start nessusd

# Habilitação do serviço para inicialização contínua junto ao boot do SO

sudo systemctl enable nessusd

# Atualização manual do banco de dados de plugins (útil para redes air-gapped)

sudo /opt/nessus/sbin/nessuscli update
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Uma instituição financeira necessita validar se a sua infraestrutura interna (10.50.0.0/24) está em estrita conformidade com as diretrizes do PCI-DSS antes de uma auditoria oficial externa. É imperativo atestar a ausência de protocolos legados (como SMBv1 ou Telnet), validar políticas de expiração de senhas e garantir o *patching* de 100% dos *hosts*. O uso de *exploits* é terminantemente proibido para evitar *downtime*.
- **Execução Prática:** O analista acessa a interface web no localhost, cria uma varredura utilizando o *template* "PCI-DSS Network Scan", insere as credenciais de um usuário com privilégios de leitura no domínio do *Active Directory* e define a sub-rede alvo.
- **Resultado Esperado:** O Nessus autenticará silenciosamente via SMB/WMI em cada servidor, lerá as chaves de registro e as políticas de grupo local. Ao concluir, entregará um relatório de auditoria segmentando falhas de *software* (CVEs pendentes) de violações de política (ex: ausência de bloqueio de conta após 5 tentativas falhas), exigidas pelo padrão PCI.

## 3.3 OpenVAS (Greenbone Vulnerability Management)

* **Descrição Acadêmica/Técnica:** O OpenVAS (*Open Vulnerability Assessment System*) é um *framework* corporativo de código aberto destinado ao gerenciamento centralizado de vulnerabilidades. Em baixo nível, não consiste em um executável isolado, mas sim em uma arquitetura baseada em múltiplos serviços: um processo gerenciador (gvmd), um servidor web para a interface de usuário (gsad) e o motor de varredura subjacente (ospd-openvas). O motor processa rotinas de testes denominadas *Network Vulnerability Tests* (NVTs), que são rotinas específicas desenvolvidas na linguagem NASL (*Nessus Attack Scripting Language*). Diferentemente de *scanners* que realizam apenas *banner grabbing* (inferência passiva), o OpenVAS atua de forma determinística por meio de varreduras autenticadas. Ele interage com o sistema de arquivos local do alvo via protocolos de administração (SMB, SSH, WMI) para auditar diretamente chaves de registro, permissões de diretórios e níveis de *patching* do *kernel*.
* **Principais Funcionalidades:**
  * Execução de varreduras profundas e autenticadas (*Credentialed Scans*) para alta precisão e eliminação de falsos positivos.
  * Auditoria de conformidade e configurações incorretas diretamente no sistema operacional do ativo.
  * Atualização contínua do banco de dados de assinaturas (NVTs, SCAP e alertas CERT) via *Greenbone Community Feed* (GCF).
  * Gerenciamento temporal das vulnerabilidades e geração de relatórios técnicos baseados nas métricas do *Common Vulnerability Scoring System* (CVSS).
* **Sintaxe e Comandos Principais:** A interação em terminal no Kali Linux é primariamente focada na gestão da infraestrutura da ferramenta, sendo a execução de varreduras conduzida pela interface web:

```bash
# 1. Sincronização mandatória dos feeds de inteligência (executada periodicamente)

sudo greenbone-feed-sync

# 2. Inicialização dos daemons e do servidor web (acesso padrão: https://127.0.0.1:9392)

sudo gvm-start

# 3. Execução de rotina de diagnóstico para validação da integridade da instalação

sudo gvm-check-setup
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Em um engajamento *White Box*, o analista necessita validar se um bloco de servidores Linux da DMZ (192.168.50.0/24) está vulnerável a falhas de escalonamento de privilégio local ou se possui bibliotecas do sistema desatualizadas (ex: OpenSSL vulnerável). O escopo exige evidências concretas, não apenas inferências baseadas em portas abertas.
- **Execução Prática:** O analista garante que os serviços estão ativos executando sudo gvm-start. No navegador corporativo, acessa [https://127.0.0.1:9392](https://127.0.0.1:9392). Navega até a seção de configurações e adiciona chaves SSH privadas no gerenciador de credenciais (*Credentials*). Em seguida, cria um escopo (*Target*) apontando para 192.168.50.0/24, associa a credencial SSH previamente cadastrada e inicia uma tarefa (*Task*) de varredura com o perfil "Full and fast".
- **Resultado Esperado:** O motor OSPd efetuará login SSH legítimo em cada máquina, rodará comandos locais (como consultas ao gerenciador de pacotes dpkg ou rpm) e validará o estado real do sistema. A interface web processará esses dados e disponibilizará um relatório em PDF ou XML pontuando os CVEs confirmados e os respectivos *links* de mitigação do fornecedor.

## 3.4 Nikto

* **Descrição Acadêmica/Técnica:** Desenvolvido em linguagem Perl e fundamentado na biblioteca de rede *LibWhisker*, o Nikto é um *scanner* de código aberto projetado estritamente para a auditoria infraestrutural de servidores HTTP/HTTPS (Camada 7 do modelo OSI). Diferente de ferramentas dinâmicas de análise de aplicação (DAST) que testam o código-fonte da aplicação (buscando falhas de lógica, SQLi ou XSS), o Nikto foca na configuração do *host*. Em baixo nível, ele envia milhares de requisições sequenciais predefinidas, avaliando as respostas do servidor (códigos HTTP, variação no tamanho da resposta e *banners*) contra um banco de dados interno de mais de 6.700 arquivos potencialmente perigosos (ex: install.php, web.config.bak), diretórios padrão ocultos, *scripts* CGI vulneráveis e ausência de cabeçalhos de segurança essenciais (*Security Headers*). Por seu volume massivo e direto de requisições, é uma ferramenta ruidosa, projetada para identificar rapidamente *low-hanging fruits* (falhas de configuração triviais).
* **Principais Funcionalidades:**
  * Detecção de indexação de diretórios habilitada (*Directory Listing*) e arquivos de *backup/logs* expostos.
  * Auditoria rigorosa de cabeçalhos de resposta HTTP (ex: X-Frame-Options, Strict-Transport-Security, Server).
  * Identificação de instalações legadas ou desatualizadas de sistemas de gerenciamento de conteúdo (CMS) e *frameworks*.
  * Capacidade de evasão básica de Sistemas de Detecção de Intrusão (IDS) via técnicas de mutação e codificação de URIs (ex: *hex encoding*).
  * Suporte nativo para roteamento de requisições via *proxies* HTTP e autenticação básica (Basic/NTLM).
* **Sintaxe e Comandos Principais:**

```bash
# Varredura padrão contra a porta HTTP (80) de um domínio ou IP

nikto -h [http://alvo.com]

# Varredura forçando a comunicação via SSL/TLS (porta 443)

nikto -h [https://alvo.com] -ssl

# Varredura otimizada e direcionada especificamente a arquivos de backup e arquivos miscelâneos

nikto -h [http://alvo.com] -Tuning 4,b

# Varredura abrangente com exportação estruturada do relatório em formato HTML

nikto -h [http://alvo.com] -Format htm -o [relatorio_web.html]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Em um engajamento de *Penetration Testing*, a equipe de infraestrutura do cliente subiu às pressas um servidor web Apache legado (10.0.30.15) para hospedar uma intranet temporária. Antes de tentar explorar os formulários de login da aplicação, o analista decide validar se os administradores deixaram arquivos de configuração críticos, *scripts* de teste do Apache ou páginas de documentação acessíveis na raiz do servidor.
- **Comando Executado:**

```bash
nikto -h http://10.0.30.15 -Tuning 1,2,3,4 -Format txt -o relatorio_nikto_intranet.txt
```

- **Resultado Esperado:** O Nikto disparará suas baterias de teste sem evasão. O *output* indicará que o cabeçalho X-XSS-Protection não está definido e revelará a existência de um arquivo /phpinfo.php esquecido na raiz do servidor (expondo variáveis de ambiente e o *path* absoluto do sistema de arquivos). Todas as ocorrências serão salvas e indexadas no arquivo relatorio_nikto_intranet.txt para inclusão como apontamento de baixa/média severidade no relatório executivo.
