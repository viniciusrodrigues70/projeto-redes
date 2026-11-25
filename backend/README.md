# 🎲 Ludo Multiplayer

Aplicação multiplayer do jogo Ludo, desenvolvida em Python utilizando arquitetura cliente-servidor e comunicação por sockets TCP.

Projeto desenvolvido como trabalho da disciplina de **Sistemas Operacionais e Redes**, do Instituto Federal de Alagoas (IFAL).

## 🎯 Objetivo

Desenvolver uma aplicação cliente-servidor que permita a realização de partidas multiplayer de Ludo, com quatro jogadores por sala, explorando conceitos fundamentais de redes de computadores, programação concorrente e orientação a objetos.

O servidor será responsável por gerenciar as conexões, controlar as partidas, validar as jogadas e manter o estado oficial do tabuleiro.

Os clientes permitirão que os jogadores participem das partidas e acompanhem as atualizações em tempo real por meio do terminal.

## 🎮 Sobre o jogo

O Ludo Multiplayer implementará uma versão do jogo clássico de Ludo, com as seguintes características:

- Quatro jogadores por partida.
- Quatro peças para cada jogador.
- Lançamento de dado de seis faces.
- Necessidade de obter seis para retirar uma peça da base.
- Movimentação das peças pelo tabuleiro.
- Captura de peças adversárias.
- Casas seguras.
- Controle de turnos.
- Área final com necessidade de pontuação exata.
- Condição de vitória baseada na conclusão das quatro peças.

As regras específicas adotadas pelo projeto serão documentadas em `docs/regras.md`.

## ⚙️ Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Python 3 | Linguagem principal |
| Socket | Comunicação por TCP |
| Threading | Atendimento simultâneo de clientes |
| JSON | Serialização e troca de mensagens |
| UUID | Identificação de jogadores e salas |
| Threading Lock | Sincronização do estado compartilhado |
| Git e GitHub | Controle de versão |

## 🏗️ Arquitetura

O sistema utilizará uma arquitetura cliente-servidor.

### Cliente

Responsável pela interação com os jogadores:

- Estabelecer conexão com o servidor.
- Informar o nome do jogador.
- Criar ou entrar em uma sala.
- Exibir o tabuleiro.
- Solicitar lançamento do dado.
- Solicitar movimentação das peças.
- Apresentar atualizações da partida.

### Servidor

Responsável pelo gerenciamento centralizado da aplicação:

- Aceitar conexões TCP.
- Identificar jogadores.
- Gerenciar conexões simultâneas.
- Criar e administrar salas.
- Controlar as regras do jogo.
- Validar as jogadas.
- Gerenciar os turnos.
- Atualizar o estado do tabuleiro.
- Comunicar alterações aos participantes.

O servidor será a única autoridade sobre o estado das partidas, impedindo que os clientes realizem alterações não autorizadas.

## 📡 Protocolo de comunicação

A comunicação entre clientes e servidor será realizada utilizando mensagens JSON transmitidas por conexões TCP persistentes.

Cada mensagem possuirá um campo `type`, responsável por identificar a operação solicitada ou o evento comunicado.

As mensagens serão delimitadas por quebras de linha (`\n`), permitindo a identificação individual de cada mensagem recebida.

### Principais tipos de mensagens

| Tipo | Descrição |
|---|---|
| CREATE_ROOM | Solicitação de criação de sala |
| JOIN_ROOM | Solicitação de entrada em sala |
| ROOM_UPDATE | Atualização dos participantes |
| START_GAME | Início da partida |
| ROLL_DICE | Solicitação de lançamento do dado |
| DICE_RESULT | Resultado do lançamento |
| MOVE_PIECE | Solicitação de movimentação |
| BOARD_UPDATE | Atualização do tabuleiro |
| PLAYER_TURN | Identificação do jogador da vez |
| PLAYER_CAPTURED | Comunicação de captura |
| GAME_OVER | Encerramento da partida |
| ERROR | Comunicação de erros |

## 🧩 Orientação a objetos

A lógica do jogo será organizada em classes com responsabilidades específicas.

| Classe | Responsabilidade |
|---|---|
| Player | Representar os jogadores |
| Piece | Representar as peças do Ludo |
| Dice | Gerenciar os lançamentos do dado |
| Board | Representar o tabuleiro e suas posições |
| LudoGame | Controlar as regras e o estado da partida |
| Room | Gerenciar os jogadores de uma sala |
| GameManager | Administrar as diferentes partidas |
| ConnectionManager | Gerenciar as conexões dos clientes |

Essa organização busca aplicar encapsulamento e responsabilidade única, evitando concentrar toda a lógica em um único componente.

## 🔄 Concorrência e sincronização

O servidor utilizará o módulo `threading` do Python para atender múltiplos clientes simultaneamente.

Cada conexão poderá ser atendida por uma thread independente.

Para evitar inconsistências no estado compartilhado das partidas, será utilizado `threading.Lock`, protegendo operações como movimentação de peças, atualização de turnos e controle das pontuações.

Cada partida possuirá seu próprio mecanismo de sincronização, permitindo que diferentes salas funcionem independentemente.

## 📁 Estrutura do projeto

```text
ludo-multiplayer/
│
├── server/
│   ├── server.py
│   ├── connection_manager.py
│   └── game_manager.py
│
├── client/
│   ├── client.py
│   ├── connection.py
│   └── interface.py
│
├── models/
│   ├── player.py
│   ├── piece.py
│   ├── dice.py
│   ├── board.py
│   ├── room.py
│   └── ludo_game.py
│
├── protocol/
│   ├── message_handler.py
│   └── message_types.py
│
├── tests/
│   ├── test_connections.py
│   ├── test_game.py
│   ├── test_rooms.py
│   └── test_protocol.py
│
├── docs/
│   ├── arquitetura.md
│   ├── regras.md
│   ├── protocolo.md
│   ├── diagrama_classes.md
│   └── evidencias/
│
├── requirements.txt
├── README.md
└── .gitignore
```

## 🚀 Instalação e execução

### Pré-requisitos

- Python 3 instalado.
- Git instalado.
- Terminal ou editor de código.

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Acessar a pasta do projeto

```bash
cd ludo-multiplayer
```

### 3. Criar um ambiente virtual

Windows:

```bash
python -m venv venv
```

Ativar:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 5. Executar o servidor

```bash
python server/server.py
```

### 6. Executar os clientes

Em outros terminais, executar:

```bash
python client/client.py
```

Cada instância do cliente representará um jogador conectado ao servidor.

Para participar de uma partida, os jogadores deverão criar uma sala ou informar o código de uma sala existente.

## 🧪 Testes

Serão realizados testes para verificar:

- Estabelecimento de conexões TCP.
- Atendimento de múltiplos clientes.
- Comunicação entre cliente e servidor.
- Criação e entrada em salas.
- Limite de quatro jogadores por partida.
- Execução simultânea de duas ou mais partidas.
- Lançamento e validação do dado.
- Movimentação das peças.
- Captura de peças adversárias.
- Proteção das casas seguras.
- Controle dos turnos.
- Condições de vitória.
- Tratamento de mensagens inválidas.
- Tratamento de desconexões.
- Sincronização do estado das partidas.

## 👥 Equipe

Projeto desenvolvido por cinco integrantes do curso Técnico em Desenvolvimento de Sistemas do IFAL.

- Vinícius Rodrigues da Silva
- Álefe Matheus Silva dos Santos
- Pablo Vinícius Costa Veiga
- Shayane Graziele da Silva
- João Vitor Matias Ferreira

**Disciplina:** Fundamentos de Sistemas Operacionais e Redes

**Professor:** Dr. Leonardo Medeiros

**Instituição:** Instituto Federal de Alagoas (IFAL) - Campus Maceió

## 📌 Status

🚧 Em desenvolvimento.

## Observação:

**Esse README.md foi feito com auxílio de ferramentas de Inteligência Artificial (IA)!**