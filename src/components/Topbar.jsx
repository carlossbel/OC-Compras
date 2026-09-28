export default function Topbar({ title, children }) {
  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="spacer" />
      {children}
    </div>
  );
}
