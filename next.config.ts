import type {
  NextConfig,
} from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=()",
  },
];

const noIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value:
      "noindex, nofollow, noarchive, nosnippet",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader:
    false,

  turbopack: {
    root:
      process.cwd(),
  },

  serverExternalPackages: [
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
    "bindings",
  ],

  async headers() {
    return [
      {
        source:
          "/:path*",
        headers: [
          ...securityHeaders,
        ],
      },
      {
        source:
          "/admin/:path*",
        headers: [
          ...noIndexHeaders,
        ],
      },
      {
        source:
          "/api/:path*",
        headers: [
          ...noIndexHeaders,
        ],
      },
      {
        source:
          "/appointments/:path*",
        headers: [
          ...noIndexHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
