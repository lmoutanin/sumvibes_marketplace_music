import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver les source maps en développement pour éviter les chemins Windows malformés
  productionBrowserSourceMaps: false,

  // Exclure les packages Node.js natifs du bundling côté serveur
  serverExternalPackages: ["pdfkit", "fs"],
  
  turbopack: {
    // Forcer l'utilisation de chemins relatifs dans Turbopack
    resolveAlias: {},
  },
  
  // Configuration pour éviter les chemins absolus Windows dans les builds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // En dev, désactiver les source maps pour éviter les chemins malformés
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;