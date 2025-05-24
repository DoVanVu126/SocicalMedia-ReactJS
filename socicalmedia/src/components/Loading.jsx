// app/loading.tsx
export default function Loading() {
  return (
      <>
        <div
            className="position-fixed vh-100 vw-100 d-flex align-items-center justify-content-center top-0 start-0"
            style={{zIndex: "99999", backgroundColor: "rgba(0,0,0,0.05)"}}>
          <div className="spinner-border text-primary" role="status" >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
  );
}