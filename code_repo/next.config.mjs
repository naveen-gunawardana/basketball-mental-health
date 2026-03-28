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
    ];
  },
};

export default nextConfig;
