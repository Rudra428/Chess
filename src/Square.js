function Square({ color, children,isCheckedKing,legmove, onClick }) {
  return (
    <div className={`square ${color}  ${isCheckedKing ? "check" : ""} ${legmove? "legal":""}`} onClick={onClick}>
      {children}
    </div>
  );
}

export default Square;
