import { useEffect, useRef, useState } from 'react';
import Board from '../components/Board.jsx';
import GameControls from '../components/GameControls.jsx';
import PlayerPanel from '../components/PlayerPanel.jsx';

const INITIAL_PLAYERS = [
  {
    id: 'player-red',
    name: 'Jogador 1',
    color: 'red',
    colorLabel: 'Vermelho',
    piecesInBase: 4,
    pieces: [
      { id: 'red-1', color: 'red', slot: 0 },
      { id: 'red-2', color: 'red', slot: 1 },
      { id: 'red-3', color: 'red', slot: 2 },
      { id: 'red-4', color: 'red', slot: 3 },
    ],
  },
  {
    id: 'player-green',
    name: 'Jogador 2',
    color: 'green',
    colorLabel: 'Verde',
    piecesInBase: 4,
    pieces: [
      { id: 'green-1', color: 'green', slot: 0 },
      { id: 'green-2', color: 'green', slot: 1 },
      { id: 'green-3', color: 'green', slot: 2 },
      { id: 'green-4', color: 'green', slot: 3 },
    ],
  },
  {
    id: 'player-yellow',
    name: 'Jogador 3',
    color: 'yellow',
    colorLabel: 'Amarelo',
    piecesInBase: 4,
    pieces: [
      { id: 'yellow-1', color: 'yellow', slot: 0 },
      { id: 'yellow-2', color: 'yellow', slot: 1 },
      { id: 'yellow-3', color: 'yellow', slot: 2 },
      { id: 'yellow-4', color: 'yellow', slot: 3 },
    ],
  },
  {
    id: 'player-blue',
    name: 'Jogador 4',
    color: 'blue',
    colorLabel: 'Azul',
    piecesInBase: 4,
    pieces: [
      { id: 'blue-1', color: 'blue', slot: 0 },
      { id: 'blue-2', color: 'blue', slot: 1 },
      { id: 'blue-3', color: 'blue', slot: 2 },
      { id: 'blue-4', color: 'blue', slot: 3 },
    ],
  },
];

function getRandomDiceFace() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function Game() {
  const [players] = useState(INITIAL_PLAYERS);
  const [activePlayerId, setActivePlayerId] = useState(INITIAL_PLAYERS[0].id);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [diceValue, setDiceValue] = useState(1);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const rollIntervalRef = useRef(null);
  const rollTimeoutRef = useRef(null);

  const clearRollTimers = () => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
      rollTimeoutRef.current = null;
    }
  };

  useEffect(() => clearRollTimers, []);

  const activePlayer =
    players.find((player) => player.id === activePlayerId) || players[0];

  const handleRollDice = () => {
    if (isRolling) return;

    clearRollTimers();
    setIsRolling(true);

    rollIntervalRef.current = setInterval(() => {
      setDiceValue(getRandomDiceFace());
    }, 90);

    rollTimeoutRef.current = setTimeout(() => {
      clearRollTimers();
      setDiceValue(getRandomDiceFace());
      setHasRolled(true);
      setIsRolling(false);
    }, 650);
  };

  const handleSelectPiece = (pieceId) => {
    setSelectedPieceId((current) => (current === pieceId ? null : pieceId));
  };

  const handleNewGame = () => {
    clearRollTimers();
    setIsRolling(false);
    setDiceValue(1);
    setHasRolled(false);
    setSelectedPieceId(null);
    setActivePlayerId(INITIAL_PLAYERS[0].id);
  };

  const selectedPieceOwner = selectedPieceId
    ? players.find((player) =>
        player.pieces.some((piece) => piece.id === selectedPieceId)
      )
    : null;

  return (
    <div className="game-page">
      <main className="game-layout">
        <div className="layout-sidebar layout-sidebar--players">
          <PlayerPanel
            players={players}
            activePlayerId={activePlayerId}
            onSelectActivePlayer={setActivePlayerId}
          />
        </div>

        <section className="layout-board-stage" aria-label="Área do tabuleiro">
          <Board
            players={players}
            activePlayerId={activePlayerId}
            selectedPieceId={selectedPieceId}
            onSelectPiece={handleSelectPiece}
          />
          <p className="board-helper-text">
            {selectedPieceOwner
              ? `Peça selecionada: ${selectedPieceOwner.name} (${selectedPieceOwner.colorLabel}) — clique novamente para desmarcar`
              : 'Clique em qualquer peça na área inicial para visualizar o destaque de seleção'}
          </p>
        </section>

        <div className="layout-sidebar layout-sidebar--controls">
          <GameControls
            activePlayer={activePlayer}
            diceValue={diceValue}
            hasRolled={hasRolled}
            isRolling={isRolling}
            onRollDice={handleRollDice}
            onNewGame={handleNewGame}
          />
        </div>
      </main>
    </div>
  );
}
