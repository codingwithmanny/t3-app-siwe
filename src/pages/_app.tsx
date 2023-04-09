// Imports
// ========================================================
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "~/utils/api";
import "~/styles/globals.css";
// SIWE Integration
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// Config
// ========================================================
/**
 * Configure chains supported
 */
const { provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

/**
 * Configure client with providers and allow for auto wallet connection
 */
const client = createClient({
  autoConnect: true,
  provider,
});

// App Wrapper Component
// ========================================================
const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <WagmiConfig client={client}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </WagmiConfig>
  );
};

// Exports
// ========================================================
export default api.withTRPC(MyApp);