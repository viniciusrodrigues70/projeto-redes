const BASES = [
  { color: 'red', label: 'Vermelho', gridRow: '1 / 7', gridColumn: '1 / 7' },
  { color: 'green', label: 'Verde', gridRow: '1 / 7', gridColumn: '10 / 16' },
  { color: 'yellow', label: 'Amarelo', gridRow: '10 / 16', gridColumn: '10 / 16' },
  { color: 'blue', label: 'Azul', gridRow: '10 / 16', gridColumn: '1 / 7' },
];

const START_CELLS = {
  '6,1': { color: 'red', direction: 'right', label: 'Saída Vermelho' },
  '1,8': { color: 'green', direction: 'down', label: 'Saída Verde' },
  '8,13': { color: 'yellow', direction: 'left', label: 'Saída Amarelo' },
  '13,6': { color: 'blue', direction: 'up', label: 'Saída Azul' },
};

const ENTRY_CELLS = {
  '7,0': { color: 'red', direction: 'right' },
  '0,7': { color: 'green', direction: 'down' },
  '7,14': { color: 'yellow', direction: 'left' },
  '14,7': { color: 'blue', direction: 'up' },
};

const SAFE_CELLS = new Set(['2,6', '6,12', '12,8', '8,2']);

function isInsideBase(row, col) {
  const inTop = row >= 0 && row <= 5;
  const inBottom = row >= 9 && row <= 14;
  const inLeft = col >= 0 && col <= 5;
  const inRight = col >= 9 && col <= 14;
  return (inTop || inBottom) && (inLeft || inRight);
}

function isInsideCenter(row, col) {
  return row >= 6 && row <= 8 && col >= 6 && col <= 8;
}

function getHomePathColor(row, col) {
  if (row === 7 && col >= 1 && col <= 5) return 'red';
  if (col === 7 && row >= 1 && row <= 5) return 'green';
  if (row === 7 && col >= 9 && col <= 13) return 'yellow';
  if (col === 7 && row >= 9 && row <= 13) return 'blue';
  return null;
}

function ArrowIcon({ direction }) {
  const rotations = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.75 14.85 8.53l6.38.93-4.61 4.5 1.09 6.35L12 17.3l-5.71 3.01 1.09-6.35-4.61-4.5 6.38-.93L12 2.75Z" />
    </svg>
  );
}

function CenterEmblemIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function buildTrackCells() {
  const cells = [];

  for (let row = 0; row < 15; row += 1) {
    for (let col = 0; col < 15; col += 1) {
      if (isInsideBase(row, col) || isInsideCenter(row, col)) {
        continue;
      }

      const key = `${row},${col}`;
      const startInfo = START_CELLS[key];
      const entryInfo = ENTRY_CELLS[key];
      const homeColor = getHomePathColor(row, col);
      const isSafe = SAFE_CELLS.has(key);

      const cellColor = startInfo?.color || homeColor;
      const classes = ['board-cell'];
      if (cellColor) classes.push(`board-cell--${cellColor}`);
      if (isSafe) classes.push('board-cell--safe');

      cells.push(
        <div
          key={key}
          className={classes.join(' ')}
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
          title={startInfo?.label || (isSafe ? 'Casa segura' : undefined)}
        >
          {startInfo && (
            <span className="cell-icon cell-icon--start">
              <ArrowIcon direction={startInfo.direction} />
            </span>
          )}
          {!startInfo && isSafe && (
            <span className="cell-icon cell-icon--star">
              <StarIcon />
            </span>
          )}
          {!startInfo && !isSafe && entryInfo && (
            <span
              className="cell-icon cell-icon--entry"
              style={{ color: `var(--${entryInfo.color})` }}
            >
              <ArrowIcon direction={entryInfo.direction} />
            </span>
          )}
        </div>
      );
    }
  }

  return cells;
}

const TRACK_CELLS = buildTrackCells();

export default function Board({
  players,
  activePlayerId,
  selectedPieceId,
  onSelectPiece,
}) {
  const playersByColor = Object.fromEntries(
    players.map((player) => [player.color, player])
  );

  return (
    <div className="board-frame">
      <div
        className="ludo-board"
        role="grid"
        aria-label="Tabuleiro de Ludo"
      >
        {BASES.map((base) => {
          const player = playersByColor[base.color];
          const isActive = player?.id === activePlayerId;
          const pieces = player?.pieces || [];

          return (
            <div
              key={base.color}
              className={`board-base board-base--${base.color} ${
                isActive ? 'board-base--active' : ''
              }`}
              style={{
                gridRow: base.gridRow,
                gridColumn: base.gridColumn,
              }}
              aria-label={`Área inicial ${base.label}`}
            >
              <div className="base-yard">
                {[0, 1, 2, 3].map((slotIndex) => {
                  const piece = pieces[slotIndex];
                  const isSelected = piece && piece.id === selectedPieceId;

                  return (
                    <div
                      key={slotIndex}
                      className={`base-slot base-slot--${base.color}`}
                    >
                      {piece && (
                        <button
                          type="button"
                          className={`ludo-piece ludo-piece--${base.color} ${
                            isSelected ? 'ludo-piece--selected' : ''
                          }`}
                          onClick={() => onSelectPiece(piece.id)}
                          aria-label={`Selecionar peça ${slotIndex + 1} do jogador ${base.label}`}
                          aria-pressed={isSelected}
                          title={`Peça ${slotIndex + 1} (${base.label})`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {TRACK_CELLS}

        <div
          className="board-center"
          style={{ gridRow: '7 / 10', gridColumn: '7 / 10' }}
          aria-label="Área central de chegada"
        >
          <svg
            className="board-center-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="0,0 50,50 0,100" fill="var(--red)" />
            <polygon points="0,0 100,0 50,50" fill="var(--green)" />
            <polygon points="100,0 100,100 50,50" fill="var(--yellow)" />
            <polygon points="0,100 50,50 100,100" fill="var(--blue)" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="#334155" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#334155" strokeWidth="1.5" />
          </svg>
          <div className="board-center-emblem">
            <CenterEmblemIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
