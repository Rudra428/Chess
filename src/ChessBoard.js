import { useState } from "react";
import Square from "./Square";
import { pieceIcons } from "./pieces";

function getCheckedKingSquare(game) {
  if (!game.isCheck()) return null;
  const board = game.board();
  const kingColor = game.turn();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === "k" && piece.color === kingColor) {
        return String.fromCharCode(97 + c) + (8 - r);
      }
    }
  }
  return null;
}

function ChessBoard({ game, makeMove, playerColor }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  const board = game.board();
  const checkedKingSquare = getCheckedKingSquare(game);
  const isCheckmate = game.isCheckmate();
  const currentTurn = game.turn();

  function handleClick(row, col) {
    const square = String.fromCharCode(97 + col) + (8 - row);
    const pieceAtSquare = game.get(square);

    
    if (selectedSquare) {
      if (pieceAtSquare && pieceAtSquare.color === currentTurn) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
        return;
      }
      const success = makeMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      if (pieceAtSquare && pieceAtSquare.color === currentTurn) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
      }
    }
  }

  return (
    <div className={`board ${playerColor === "b" ? "rotate" : ""}`}>
      {board.map((row, r) =>
        row.map((piece, c) => {
          const squareKey = String.fromCharCode(97 + c) + (8 - r);
          const isLegalMove = legalMoves.includes(squareKey);
          const isCheckedKing = squareKey === checkedKingSquare;
          const isKingInCheckmate = isCheckmate && piece?.type === "k" && piece?.color === currentTurn;
          const squareColor = (r + c) % 2 === 0 ? "white" : "black";

          return (
            <Square
              key={`${r}${c}`}
              color={squareColor}
              isCheckedKing={isCheckedKing}
              legmove={isLegalMove}
              onClick={() => handleClick(r, c)}
            >
              {piece && (
                <img
                  src={pieceIcons[piece.color + piece.type]}
                  alt=""
                  className={`piece ${playerColor === "b" ? "rotate" : ""} ${isKingInCheckmate ? "fell" : ""}`}
                  draggable={false}
                />
              )}
            </Square>
          );
        })
      )}
    </div>
  );
}

export default ChessBoard;