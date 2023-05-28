// Imports
// ========================================================
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "~/utils/api";
import "~/styles/globals.css";
// SIWE Integration
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

// Config
// ========================================================

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

/**
 * Configure publicProvider and allow for auto wallet connection
 */

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

// App Wrapper Component
// ========================================================
const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <WagmiConfig config={config}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </WagmiConfig>
  );
};

// Exports
// ========================================================
export default api.withTRPC(MyApp);
