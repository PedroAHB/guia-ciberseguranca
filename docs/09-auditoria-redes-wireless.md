# 9. Auditoria de Redes Sem Fio (Wireless/RF)

Esta seção desvia-se do paradigma de redes cabeadas (TCP/IP) para operar diretamente na Camada 1 e 2 do modelo OSI, através da manipulação de interfaces de rádio frequência. O foco recai sobre a interceptação passiva de tráfego eletromagnético, a exploração de falhas criptográficas e de implementação nos protocolos de segurança Wi-Fi (WEP/WPA/WPA2/WPS) e a auditoria de outros meios de comunicação sem fio, como Bluetooth.

## 9.1 Aircrack-ng

* **Descrição Acadêmica/Técnica:** O Aircrack-ng não é uma ferramenta isolada, mas uma suíte completa de utilitários em C, especializada na auditoria de segurança de redes Wi-Fi (802.11), cuja operação fundamental depende da capacidade da placa de rede sem fio de operar em *modo monitor* — um estado de baixo nível no qual a interface captura todos os quadros (*frames*) 802.11 no ar dentro do seu alcance de rádio, incluindo aqueles não destinados ao próprio dispositivo, ao contrário do *modo managed* convencional. Composta por ferramentas especializadas e encadeadas (airmon-ng para gerência de interfaces, airodump-ng para captura e despejo de pacotes, aireplay-ng para injeção de pacotes forjados, e aircrack-ng propriamente, o motor de quebra criptográfica), a suíte implementa ataques estatísticos contra a cifra RC4 do WEP e a captura determinística do *4-way handshake* do WPA/WPA2, cuja quebra subsequente depende da derivação criptográfica PBKDF2 contra uma *wordlist*.  
* **Principais Funcionalidades:**  
  * Gerenciamento de interfaces de rede sem fio, alternando entre modo gerenciado (*managed*) e modo monitor (*monitor mode*).  
  * Captura passiva de tráfego 802.11 e despejo estruturado em arquivos *.cap*, incluindo *beacons*, *probes* e *handshakes*.  
  * Injeção ativa de pacotes forjados, incluindo o envio de *deauthentication frames* para forçar a reconexão de clientes (e a consequente captura do *handshake*).  
  * Quebra criptográfica offline de chaves WEP (via exploração estatística de vetores de inicialização fracos) e de senhas WPA/WPA2-PSK (via ataque de dicionário contra o *handshake* capturado).  
  * Suporte a ataques específicos contra o protocolo WPS (*Wi-Fi Protected Setup*) através de força bruta do PIN.

**Sintaxe e Comandos Principais:**  

```bash
# Ativação do modo monitor na interface sem fio, encerrando processos conflitantes previamente

sudo airmon-ng check kill

sudo airmon-ng start [interface_sem_fio]

# Varredura e captura de tráfego de todas as redes próximas visíveis no alcance de rádio

sudo airodump-ng [interface_em_modo_monitor]

# Captura direcionada a uma rede específica (BSSID e canal), salvando os pacotes em arquivo

sudo airodump-ng --bssid [MAC_do_roteador] --channel [canal] -w [arquivo_captura] [interface_em_modo_monitor]

# Injeção de pacotes de desautenticação para forçar a reconexão de um cliente (e captura do handshake)

sudo aireplay-ng --deauth [numero_de_pacotes] -a [MAC_do_roteador] -c [MAC_do_cliente] [interface_em_modo_monitor]

# Quebra offline da senha WPA/WPA2 a partir do handshake capturado, utilizando uma wordlist

aircrack-ng [arquivo_captura.cap] -w [wordlist.txt]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Em uma auditoria de segurança física autorizada, o analista precisa validar a robustez da senha da rede Wi-Fi corporativa protegida por WPA2-PSK ("RedeCorp\_5G"), capturando o *handshake* de autenticação de um dispositivo cliente já conectado e submetendo-o a um ataque de dicionário direcionado (gerado previamente via Crunch, conforme seção anterior).  
  * **Comandos Executados:**  

```bash
sudo airmon-ng start wlan0

sudo airodump-ng --bssid AA:BB:CC:DD:EE:FF --channel 6 -w captura_corp wlan0mon

sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF -c 11:22:33:44:55:66 wlan0mon

aircrack-ng captura_corp-01.cap -w wordlist_techcorp_wifi.txt
```

* **Resultado Esperado:** A desautenticação forçará o cliente a se reconectar automaticamente, momento em que o airodump-ng capturará com sucesso o *4-way handshake* (indicado no cabeçalho superior da tela de captura). O aircrack-ng então testará cada senha candidata da *wordlist* contra o *handshake*, derivando a chave PMK correspondente. Ao encontrar a correspondência, exibirá a mensagem "KEY FOUND\!" seguida da senha em texto claro da rede Wi-Fi.

## 9.2 Wifite

* **Descrição Acadêmica/Técnica:** O Wifite é uma ferramenta de automação escrita em Python, projetada para orquestrar o fluxo completo de ataques contra redes sem fio ao encapsular e sequenciar a execução de múltiplas ferramentas subjacentes especializadas (Aircrack-ng, Reaver, Hashcat, entre outras) sob uma única interface de linha de comando simplificada. Em baixo nível, a ferramenta automatiza integralmente o ciclo operacional que seria manual no Aircrack-ng: ativação do modo monitor, varredura e listagem de todos os alvos próximos ordenados por força de sinal (RSSI), seleção heurística automática do vetor de ataque mais eficiente disponível para cada rede específica (WPS, captura de *handshake* WPA ou quebra de chave WEP), execução do ataque de desautenticação e, por fim, o encaminhamento automático do artefato capturado para o motor de quebra apropriado.  
* **Principais Funcionalidades:**  
  * Automação integral do ciclo de ataque contra redes sem fio, minimizando a intervenção manual do operador.  
  * Priorização e seleção automática de alvos com base na força do sinal (RSSI) e no vetor de ataque mais provável de sucesso.  
  * Ataques automatizados contra o protocolo WPS (Pixie-Dust e força bruta de PIN via Reaver/Bully).  
  * Captura automatizada de *handshakes* WPA/WPA2 com envio configurável de pacotes de desautenticação.  
  * Organização automática e estruturada dos artefatos capturados (handshakes, PINs, senhas) em diretório de sessão dedicado.

**Sintaxe e Comandos Principais:**  

```bash
# Execução padrão, iniciando a varredura interativa de todas as redes próximas disponíveis

sudo wifite

# Execução direcionada a um alvo específico pelo BSSID, ignorando o menu de seleção interativo

sudo wifite --bssid [MAC_do_roteador]

# Execução restringindo o escopo exclusivamente a ataques contra o protocolo WPS

sudo wifite --wps

# Execução em modo não interativo, atacando automaticamente todos os alvos elegíveis sem confirmação manual

sudo wifite --all --kill
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante uma avaliação de segurança física em um perímetro corporativo com múltiplos pontos de acesso Wi-Fi visíveis (redes corporativas, redes de convidados e possíveis roteadores de IoT mal configurados), o analista precisa de uma abordagem rápida e automatizada para identificar qual das redes disponíveis representa o vetor de ataque mais fácil, sem gastar tempo analisando manualmente cada uma.  
  * **Execução Prática:** O analista executa sudo wifite, aguardando a listagem de todas as redes detectadas ordenadas por intensidade de sinal. Identificando visualmente que uma das redes ("IoT\_Camera\_Setup") possui o protocolo WPS habilitado (indicador de alta probabilidade de sucesso), seleciona-a diretamente pelo número correspondente no menu interativo.  
  * **Resultado Esperado:** O Wifite identificará automaticamente a vulnerabilidade WPS, executará um ataque *Pixie-Dust* (exploração de aleatoriedade criptográfica fraca na implementação) contra o roteador. Em caso de sucesso, exibirá diretamente no terminal tanto o PIN de 8 dígitos do WPS quanto a senha WPA2-PSK em texto claro derivada, sem exigir qualquer ataque de força bruta prolongado contra a senha propriamente dita.

## 9.3 Kismet

* **Descrição Acadêmica/Técnica:** O Kismet é um *framework* de detecção, coleta e análise de redes sem fio, desenvolvido em C++, que opera como um *sniffer* passivo multiplataforma e multiprotocolo (802.11 Wi-Fi, Bluetooth Classic/BLE, Zigbee, RFID e Sistemas de Rádio Definido por Software \- SDR). Diferente do Aircrack-ng, cuja arquitetura é centrada primariamente em quebra criptográfica ativa, o Kismet é arquitetado como uma plataforma de inteligência de sinais (*Signals Intelligence*/SIGINT) contínua e passiva, empregando um modelo *servidor-cliente*: um processo *backend* (kismet\_server) gerencia múltiplas fontes de captura simultâneas (várias placas Wi-Fi, dongles Bluetooth, receptores SDR) e agrega os dados em um banco relacional (SQLite), enquanto a interface web (kismet\_client, acessível via navegador) exibe visualizações em tempo real, incluindo detecção heurística de anomalias como *rogue access points*, ataques de desautenticação em andamento e dispositivos realizando *fingerprinting* via *probe requests*.  
* **Principais Funcionalidades:**  
  * Detecção e monitoramento passivo e simultâneo de múltiplos protocolos sem fio (802.11, Bluetooth, Zigbee) através de fontes de captura concorrentes.  
  * Identificação heurística de anomalias de segurança em tempo real, como *rogue access points*, redes duplicadas (*Evil Twin*) e ataques de desautenticação ativos.  
  * Rastreamento detalhado (*fingerprinting*) de dispositivos móveis e clientes através da análise de *probe requests* e padrões de endereço MAC.  
  * Interface web nativa para visualização, mapeamento GPS e análise histórica dos dados coletados armazenados em banco de dados SQLite.  
  * Arquitetura extensível via plugins para suporte a novos tipos de fontes de captura, incluindo receptores de Rádio Definido por Software (SDR).

**Sintaxe e Comandos Principais:**  

```bash
# Inicialização do servidor especificando a interface de captura sem fio a ser utilizada

sudo kismet -c [interface_sem_fio]

# Inicialização com múltiplas fontes de captura simultâneas (ex: Wi-Fi e Bluetooth)

sudo kismet -c [interface_wifi] -c [interface_bluetooth]

# Acesso à interface web de visualização e análise (padrão: porta 2501)

# Navegador: http://localhost:2501

# Consulta programática direta aos dispositivos detectados via API REST do Kismet

curl -s http://localhost:2501/devices/all_devices.json -u [usuario]:[senha]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante uma auditoria de segurança física contínua em um escritório corporativo, a equipe de segurança suspeita da presença de um *rogue access point* — um ponto de acesso não autorizado, possivelmente instalado maliciosamente por um insider, imitando o SSID legítimo da rede corporativa para capturar credenciais de funcionários desavisados (*Evil Twin*).  
  * **Execução Prática:** O analista posiciona um dispositivo com o Kismet em execução contínua (sudo kismet \-c wlan1mon) em um local central do escritório, monitorando passivamente por um período de 24 horas. Periodicamente, acessa a interface web em http://localhost:2501 para revisar os alertas gerados automaticamente pelo motor de detecção de anomalias.  
  * **Resultado Esperado:** O Kismet identificará e alertará sobre duas redes distintas fisicamente (endereços MAC/BSSID diferentes) transmitindo exatamente o mesmo SSID corporativo, classificando o evento como uma possível anomalia de *Evil Twin*. O relatório incluirá o endereço MAC do dispositivo suspeito, a intensidade do sinal (permitindo estimativa de localização física) e o histórico temporal de sua atividade, fornecendo evidências concretas para uma investigação de segurança física subsequente.
