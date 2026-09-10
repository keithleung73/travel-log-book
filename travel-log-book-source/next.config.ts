import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["xlsx"],
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "0.0.0.0",
    "::1",
    "**.cursor.com",
    "**.cursor.sh",
    "**.cursorusercontent.com",
  ],
};

export default nextConfig;
