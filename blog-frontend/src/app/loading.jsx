export default function LoadingPage() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-75 py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
