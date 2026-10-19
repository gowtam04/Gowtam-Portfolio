import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The expense auditor and resume shortlister merged into one Oracle Fusion study.
    return ["expense-ai-auditing", "ai-resume-parser"].map((slug) => ({
      source: `/case-studies/${slug}`,
      destination: "/case-studies/oracle-fusion-ai-utilities",
      permanent: true,
    }));
  },
};

export default nextConfig;
