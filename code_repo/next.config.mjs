/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      // Canonicalize to non-www — fixes "Duplicate without user-selected canonical" in GSC
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mentalitysports.com" }],
        destination: "https://mentalitysports.com/:path*",
        permanent: true,
      },
      {
        source: "/resources",
        destination: "/advice",
        permanent: true,
      },
      {
        source: "/resources/:slug",
        destination: "/advice/:slug",
        permanent: true,
      },
      {
        source: "/donate",
        destination: "https://gofund.me/535c025ab",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
