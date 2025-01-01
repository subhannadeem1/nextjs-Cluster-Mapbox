import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css"; 

export const metadata = {
  title: "Mapbox Cluster Example",
  description: "A Next.js application with Mapbox clustering functionality",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ height: "100vh", width: "100%" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
