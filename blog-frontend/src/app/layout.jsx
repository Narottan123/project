import "@/styles/globals.css";
import "@/styles/blog.css";
import Providers from "./providers";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "DevBlog - Full Stack MERN Platform",
  description: "A modern, full-featured MERN blog platform with user authentication, role-based access control, post & comment management, and real-time updates.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.8/css/bootstrap.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <Providers>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
