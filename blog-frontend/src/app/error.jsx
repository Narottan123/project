"use client";

import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8f9fb 0%, #eef1f6 50%, #f8f9fb 100%)",
        padding: "20px",
      }}
    >
      <div
        className="bg-white shadow-lg text-center"
        style={{
          maxWidth: "620px",
          width: "100%",
          borderRadius: "24px",
          padding: "55px 45px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-4 d-flex align-items-center justify-content-center"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(220,53,69,0.08)",
          }}
        >
          <i
            className="zmdi zmdi-alert-circle text-danger"
            style={{ fontSize: "52px" }}
          ></i>
        </div>

        {/* Title */}
        <h1
          className="fw-bold mb-3"
          style={{
            fontSize: "42px",
            color: "#1f2937",
            lineHeight: "1.2",
          }}
        >
          Oops! Something went wrong
        </h1>

        {/* Description */}
        <p
          className="mb-4"
          style={{
            fontSize: "17px",
            color: "#6b7280",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          An unexpected error occurred while loading this page. You can retry
          the request or safely return to your dashboard.
        </p>

        {/* Error Message */}
        {process.env.NODE_ENV === "development" && error?.message && (
          <div
            className="mb-4"
            style={{
              background: "#fff5f5",
              border: "1px solid #ffd6d6",
              color: "#dc3545",
              borderRadius: "14px",
              padding: "14px 18px",
              fontSize: "14px",
              wordBreak: "break-word",
            }}
          >
            {error.message}
          </div>
        )}

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
          <button
            onClick={() => reset()}
            className="btn"
            style={{
              background: "#0d6efd",
              color: "#fff",
              borderRadius: "40px",
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: "600",
              border: "none",
              minWidth: "150px",
            }}
          >
            <i className="zmdi zmdi-refresh mr-2"></i> Try Again
          </button>

          <button
            onClick={() => router.push("/")}
            className="btn"
            style={{
              background: "#fff",
              color: "#111827",
              borderRadius: "40px",
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: "600",
              border: "1px solid #d1d5db",
              minWidth: "150px",
            }}
          >
            <i className="zmdi zmdi-home mr-2"></i> Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
