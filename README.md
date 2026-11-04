# 🎲 Tabuleiro Virtual via Terminal

Este projeto consiste em uma aplicação cliente/servidor baseada em texto (CLI) desenvolvida em **Python**, que simula um jogo de tabuleiro por turnos em tempo real. O foco principal deste projeto é a aplicação prática de conceitos de **Sistemas Operacionais** e **Redes de Computadores**, como programação com Sockets, arquitetura multithread, controle de concorrência e sincronização de dados na memória RAM.

Trabalho prático desenvolvido para a disciplina de Redes de Computadores do Curso Técnico.

---

## 🚀 Pilares Técnicos Implementados

1. **Protocolo de Rede (IP/TCP):** Utiliza a biblioteca nativa `socket` configurada com `AF_INET` (IPv4) e `SOCK_STREAM` (**TCP**). A escolha do TCP justifica-se pela necessidade de confiabilidade absoluta: os comandos de jogadas e atualizações do tabuleiro não podem sofrer perdas ou inversão de ordem, sob o risco de quebrar a sincronização entre os terminais.
2. **Arquitetura Multithread (Tempo Real):** 
   * **No Servidor:** Uma thread principal gerencia o recebimento de novas conexões via `accept()`, despachando uma nova linha de execução (`threading.Thread`) para cada cliente. Isso impede que um terminal bloqueie o outro.
   * **No Cliente:** O terminal do jogador executa **duas threads paralelas**. A thread principal captura a digitação do usuário (`input`), enquanto uma thread assíncrona em background escuta a rede (`recv`), atualizando o tabuleiro em tempo real na tela sempre que um oponente joga.
3. **Controle de Concorrência:** O estado do jogo (nomes, posições e turnos) é mantido de forma volátil na **memória RAM do servidor**. Como múltiplas threads de clientes acessam e modificam essas mesmas variáveis simultaneamente, há um cenário de concorrência sujeito a Condições de Corrida (*Race Conditions*).
4. **Sincronização (Mutex):** Para neutralizar os riscos da concorrência, foi implementado um mecanismo de exclusão mútua através da classe `threading.Lock()`. O bloco `with lock:` assegura que a leitura da vez, a rolagem aleatória do dado e a atualização da posição na RAM ocorram de forma **atômica** (uma thread por vez).

---

## 📁 Estrutura de Arquivos e Divisão do Grupo

O projeto foi modularizado em 4 arquivos independentes para garantir boas práticas de engenharia de software e divisão justa de trabalho para **4 integrantes**:

*   **`config.py` (Integrante 1 — Arquiteto de Protocolo):** Centraliza as constantes de rede (IP, Porta, limite de casas) e as funções de serialização/deserialização em formato **JSON**.
*   **`jogo.py` (Integrante 2 — Engenheiro de Regras):** Abstrai toda a regra de negócio do jogo (cálculo do dado, validação restrita de turnos, incremento de posições na RAM e checagem da condição de vitória na casa 20).
*   **`servidor.py` (Integrante 3 — Administrador de Infraestrutura):** Inicializa o Socket TCP do servidor, gerencia o ciclo de vida das threads de conexões, implementa o **Mutex (Lock)** e realiza os envios globais (*Broadcast*).
*   **`cliente.py` (Integrante 4 — Desenvolvedor de Interface):** Constrói o terminal interativo do usuário, disparando a thread assíncrona de escuta e tratando o fluxo de inputs de comandos do jogador.

---

## 🛠️ Como Executar o Projeto

Certifique-se de ter o Python 3.x instalado em sua máquina. Não é necessária a instalação de nenhuma biblioteca externa (`pip`), todas são nativas da linguagem.

### 1. Preparação da Rede
Caso vá testar todos os jogadores no **mesmo computador**, mantenha a constante `IP_SERVIDOR = '127.0.0.1'` dentro do arquivo `config.py`. 
*Se for testar em computadores diferentes na rede do laboratório, mude o valor de `IP_SERVIDOR` para o IP local do computador que executará o servidor.*

### 2. Inicializar o Servidor
Abra um terminal na pasta do projeto e execute:
```bash
python servidor.py
```
O prompt indicará que o servidor está ativo na porta 5555 aguardando conexões.

### 3. Conectar os Clientes (Jogadores)
Abra novos terminais (um para cada jogador) e execute:
```bash
python cliente.py
```
À medida que os clientes entram, o servidor atribui automaticamente os nomes (`Jogador 1`, `Jogador 2`, etc.) e dita o turno inicial em tempo real na tela de todos.

### 🎮 Regras do Jogo no Terminal
*   Digite `rolar` quando for o seu turno para lançar o dado virtual (1 a 6).
*   Se tentar digitar `rolar` fora do seu turno, o servidor recusará a jogada e enviará um alerta privado de erro.
*   Digite `sair` a qualquer momento para desconectar o seu terminal com segurança.
*   O primeiro jogador a atingir ou ultrapassar a **casa 30** vence a partida, disparando um anúncio global e resetando o tabuleiro na memória RAM para uma nova rodada.
