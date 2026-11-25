export default function PlayerPanel({
  players,
  activePlayerId,
  onSelectActivePlayer,
}) {
  return (
    <aside className="panel-card" aria-label="Painel dos jogadores">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Jogadores</h2>
          <p className="panel-subtitle">Clique para destacar turno (demo)</p>
        </div>
      </div>

      <div className="player-list">
        {players.map((player) => {
          const isActive = player.id === activePlayerId;
          const piecesCount = player.piecesInBase;

          return (
            <button
              key={player.id}
              type="button"
              className={`player-card player-card--${player.color} ${
                isActive ? 'player-card--active' : ''
              }`}
              onClick={() => onSelectActivePlayer(player.id)}
              aria-pressed={isActive}
            >
              <div className="player-identity">
                <span
                  className={`player-swatch player-swatch--${player.color}`}
                  aria-hidden="true"
                />
                <div className="player-meta">
                  <span className="player-name">{player.name}</span>
                  <span className="player-color-label">{player.colorLabel}</span>
                </div>
              </div>

              <div className="player-status">
                {isActive && (
                  <span className={`active-pill active-pill--${player.color}`}>
                    <span className="active-pill-dot" />
                    Na vez
                  </span>
                )}

                <div
                  className="base-pips"
                  title={`${piecesCount} peças na área inicial`}
                >
                  {[0, 1, 2, 3].map((pipIndex) => (
                    <span
                      key={pipIndex}
                      className={`base-pip base-pip--${player.color} ${
                        pipIndex < piecesCount ? 'base-pip--filled' : ''
                      }`}
                    />
                  ))}
                  <span className="base-count-text">{piecesCount}/4</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
