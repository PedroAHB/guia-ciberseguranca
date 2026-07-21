# 2. Enumeração Ativa e Mapeamento de Rede

Diferente do reconhecimento passivo, esta fase exige interação direta com a infraestrutura do alvo. O objetivo é enviar pacotes de rede forjados e analisar as respostas para mapear a topologia, identificar *hosts* vivos, determinar o estado de portas (abertas, fechadas, filtradas por *firewalls*) e realizar o *fingerprinting* de serviços e sistemas operacionais.

## 2.1 Nmap (Network Mapper)

* **Descrição Acadêmica/Técnica:** Nmap é um utilitário de código aberto para exploração de rede e auditoria de segurança. Em baixo nível, opera manipulando *sockets* brutos (*Raw Sockets*) para forjar pacotes customizados nas camadas 3 (Rede) e 4 (Transporte) do modelo OSI. Através da análise determinística e probabilística dos pacotes de resposta (como *flags* TCP SYN/ACK/RST, mensagens ICMP e peculiaridades do *Initial Sequence Number* \- ISN), a ferramenta infere o estado das portas e a identidade do *stack* TCP/IP do alvo. Além do mapeamento, o Nmap integra um motor de execução (NSE \- *Nmap Scripting Engine*) baseado na linguagem Lua, expandindo sua capacidade para auditoria automatizada e detecção de vulnerabilidades (*CVEs*).  
* **Principais Funcionalidades:**  
  * Descoberta de *hosts* (*Host Discovery/Ping Sweep*) via requisições ICMP, TCP e ARP.  
  * Execução de múltiplos algoritmos de varredura (TCP SYN *Stealth*, TCP Connect, UDP, XMAS, FIN, ACK).  
  * Extração de *banners* e análise de comportamento para detecção precisa da versão de *daemons* em execução (-sV).  
  * Motor NSE com centenas de *scripts* categorizados (ex: *default, vuln, safe, intrusive*).  
  * Controle granular de *timing*, fragmentação de pacotes e MTU para evasão de *Firewalls* e IDS/IPS.

**Sintaxe e Comandos Principais:**  

```bash
# Varredura de descobrimento de rede (Ping Sweep via ARP/ICMP) sem port scan

nmap -sn 192.168.1.0/24

# Varredura TCP SYN furtiva padrão (requer privilégios de root)

sudo nmap -sS [alvo_ou_IP]

# Varredura Agressiva (Detecção de SO, Versões, Scripting padrão e Traceroute)

sudo nmap -A [alvo_ou_IP]

# Varredura completa (65535 portas), extração de versões e exportação de relatórios

sudo nmap -sS -p- -sV [alvo_ou_IP] -oA [nome_do_arquivo_saida]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante um engajamento de *Internal Pentest*, o analista obteve acesso à VLAN corporativa interna de servidores (10.0.5.0/24). A prioridade é mapear rapidamente todos os *hosts* vivos, descobrir todas as portas TCP abertas e identificar as versões exatas dos serviços para posterior pesquisa de *exploits* no Metasploit, garantindo que os artefatos fiquem salvos para documentação.

**Comando Executado:**  

```bash
sudo nmap -sS -p- -sV -O --min-rate 1000 10.0.5.0/24 -oA recon_interna_vlan5
```

* **Resultado Esperado:** O comando enviará pacotes SYN massivos de forma assíncrona (garantindo o envio mínimo de 1000 pacotes por segundo via \--min-rate) para todas as 65.535 portas (-p-) de cada IP vivo na sub-rede. Ele aplicará assinaturas para descobrir o Sistema Operacional (-O) e as versões dos serviços (-sV). O resultado será exportado em três formatos distintos (XML, formato Nmap e formato *Grepable*) utilizando o prefixo recon\_interna\_vlan5, facilitando a integração contínua na esteira de auditoria.

## 2.2 Masscan

* **Descrição Acadêmica/Técnica:** O Masscan é um *scanner* de portas TCP/UDP assíncrono arquitetado para varreduras de escopo global (ex: mapeamento de todo o espaço de endereçamento IPv4). Diferente do Nmap, que interage com a pilha TCP/IP do *kernel* do sistema operacional e aloca recursos para gerenciar o estado de cada conexão, o Masscan implementa sua própria micro-pilha TCP/IP em espaço de usuário (*user-space*). Operando de forma estritamente assíncrona via *raw sockets* (e suportando *drivers* de captura otimizados como o PF\_RING), ele separa as *threads* de transmissão e recepção. Isso permite o envio ininterrupto de pacotes SYN e o processamento reativo de respostas SYN/ACK de forma independente, atingindo taxas teóricas de até 10 milhões de pacotes por segundo.  
* **Principais Funcionalidades:**  
  * Transmissão assíncrona de alto desempenho com *bypass* da pilha de rede do *kernel*.  
  * Controle restrito e granular da banda utilizada via limitação exata de pacotes por segundo (--rate).  
  * Compatibilidade intencional com a sintaxe de comandos e formatos de saída do Nmap (XML, Grepable, JSON).  
  * Suporte à captura de *banners* de serviços em escala de rede.

  * Capacidade de interrupção (pausa) e retomada de varreduras de longa duração, gerando e lendo arquivos de estado de execução.

**Sintaxe e Comandos Principais:**  

```bash
# Varredura de uma porta específica em um bloco de rede definindo a taxa (ex: 10.000 pacotes/segundo)

sudo masscan -p[porta] [bloco_IP_ou_CIDR] --rate=[numero_de_pacotes]

# Varredura das portas mais comuns em múltiplos blocos, com exportação no formato Grepable

sudo masscan --top-ports 100 10.0.0.0/8 192.168.0.0/16 --rate=100000 -oG [arquivo.grep]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante um engajamento de *Red Teaming* ou análise de superfície de ataque externa de um grande provedor de serviços, o analista recebe um escopo abrangendo um bloco de endereços /16 (65.536 IPs). O objetivo primário e imediato é identificar todos os *hosts* que possuem serviços de administração remota expostos para a internet (RDP \- 3389 e SSH \- 22), operando em velocidade máxima antes de aplicar varreduras de vulnerabilidades mais lentas (via Nmap).

**Comando Executado:**  

```bash
sudo masscan -p22,3389 203.0.113.0/16 --rate=50000 -oG recon_massivo_admin.grep
```

* **Resultado Esperado:** O Masscan processará todos os endereços do bloco /16 focado estritamente nas portas 22 e 3389, transmitindo a uma taxa constante de 50.000 pacotes por segundo. A execução será concluída em poucos segundos. Os IPs que responderem positivamente terão seus registros (IP e porta aberta) salvos no arquivo recon\_massivo\_admin.grep, fornecendo uma sub-lista de alvos refinada para a próxima etapa da auditoria.

## 2.3 Netdiscover

* **Descrição Acadêmica/Técnica:** Operando exclusivamente na Camada 2 (Enlace de Dados) do modelo OSI, o Netdiscover é uma ferramenta projetada para a identificação de *hosts* vivos em redes locais (LANs) utilizando o protocolo ARP (*Address Resolution Protocol*). Diferente de varredores tradicionais que operam nas camadas 3 e 4 via ICMP ou TCP/UDP, o Netdiscover não depende de roteamento. Ele identifica ativos injetando requisições ARP no domínio de *broadcast* (modo ativo) ou interceptando tráfego ARP preexistente (modo passivo). Como o tráfego ARP é fundamental para a comunicação em rede local e raramente filtrado por *firewalls* de *host* (como o Windows Defender Firewall), o Netdiscover é altamente eficaz para mapear ativos antes da execução de varreduras de portas em camadas superiores.  
* **Principais Funcionalidades:**  
  * Operação bidirecional: Mapeamento ativo (injeção de *requests*) e reconhecimento estritamente passivo (escuta de *promiscuous mode*).  
  * Resolução automática de *Organizationally Unique Identifier* (OUI) para identificar os fabricantes das placas de rede (ex: Cisco, VMware, Apple), auxiliando no *fingerprinting* inicial de dispositivos (ex: impressoras vs. *hypervisors*).  
  * Modificação de endereços MAC de origem (MAC *spoofing* nativo) durante requisições ativas para dificultar o rastreamento em sistemas de detecção de intrusão (NIDS).

**Sintaxe e Comandos Principais:**  

```bash
# Varredura ativa em uma sub-rede específica (requer privilégios de root)

sudo netdiscover -r [bloco_IP_ou_CIDR]

# Varredura ativa especificando a interface de rede (ex: eth0 ou wlan0)

sudo netdiscover -i [interface] -r [bloco_IP_ou_CIDR]

# Modo de escuta passiva (não envia pacotes, apenas analisa o tráfego ARP local)

sudo netdiscover -p -i [interface]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Em um engajamento de *Physical Penetration Testing* ou após comprometer um dispositivo na rede interna (ex: via *pivot* de uma máquina Windows), o analista precisa mapear os *hosts* da VLAN corporativa 192.168.10.0/24. O ambiente possui um IDS rigoroso (*Intrusion Detection System*) que bloqueia varreduras ICMP/TCP de imediato. A prioridade é obter uma lista silenciosa de endereços IP e MACs vivos antes de lançar ataques direcionados.

**Comando Executado:**  

```bash
sudo netdiscover -p -i eth0
```

* **Resultado Esperado:** A placa de rede eth0 entrará em modo promíscuo, escutando passivamente os anúncios ARP pela rede sem transmitir um único pacote. A ferramenta construirá em tempo real uma tabela contendo os IPs, endereços MAC associados e o fabricante do *hardware* de cada *host* ativo na rede que esteja transmitindo dados.

## 2.4 Legion

* **Descrição Acadêmica/Técnica:** O Legion é um *framework* de *penetration testing* semi-automatizado, com interface gráfica desenvolvida em Python (via PyQt), que atua como um orquestrador para diversas ferramentas subjacentes de varredura e exploração (como Nmap, Masscan, Nikto, Dirb, Enum4linux e Hydra). Sua arquitetura baseia-se em execução sensível ao contexto (*context-aware automation*): ao identificar um serviço específico em uma porta (ex: HTTP na porta 80), o *framework* dinamicamente sugere e automatiza a execução de *scripts* e varreduras direcionadas exclusivamente àquele protocolo. Em baixo nível, ele abstrai a sintaxe complexa de múltiplos utilitários de linha de comando, estruturando os retornos padrão (*stdout/stderr*) em um banco de dados relacional local (SQLite) para centralização de evidências e gerenciamento de estado do projeto.  
* **Principais Funcionalidades:**  
  * Interface gráfica interativa para visualização em árvore de *hosts*, portas, serviços e vulnerabilidades.  
  * Execução modular e encadeada de ferramentas baseada em assinaturas de serviços descobertos.  
  * Parametrização ajustável para intensidade de varredura (*Easy*, *Hard*, *Custom*), mitigando riscos de interrupção de serviços (*Denial of Service* acidental).  
  * Centralização de *logs* de terminal e captura automática de artefatos para geração de relatórios de auditoria.  
* **Sintaxe e Comandos Principais:** Sendo uma aplicação estritamente gráfica, a interação via CLI é limitada à inicialização com privilégios elevados para garantir o funcionamento adequado dos manipuladores de rede (*raw sockets*) do Nmap e Masscan.  

```bash
# Inicialização do framework (requer privilégios de root para varreduras furtivas e de SO)

sudo legion
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Um auditor de segurança recebe um escopo de 50 servidores corporativos mesclados (Windows e Linux). Para otimizar o tempo de *assessment* e evitar a digitação manual de dezenas de comandos para cada serviço descoberto (ex: mapeamento SMB, *fuzzing* web, tentativas de login anônimo via FTP), ele opta por uma abordagem orquestrada que centralize os dados para facilitar a escrita do relatório final.  
  * **Execução Prática:** O analista abre o terminal e executa sudo legion. Na interface gráfica, adiciona a sub-rede 10.0.10.0/24 ao escopo e inicia uma varredura padrão.  
  * **Resultado Esperado:** O Legion executará o Nmap em *background*. Assim que descobrir, por exemplo, a porta 445 aberta em um *host*, ele automaticamente ativará *scripts* NSE do Nmap para enumeração de SMB e rodará o enum4linux contra aquele IP específico. O analista poderá navegar pela GUI e clicar no *host* para ler os resultados estruturados de todas essas ferramentas simultaneamente em um único painel.
