/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
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
