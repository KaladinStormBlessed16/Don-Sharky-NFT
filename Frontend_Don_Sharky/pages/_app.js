import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { ToastContainer } from "react-toastify";

const { chains, provider } = configureChains(
  [chain.goerli], // DEV
  [
    jsonRpcProvider({
      rpc: () => ({ http: process.env.NEXT_PUBLIC_RPC_URL }),
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Don Sharky",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#36AEDE",
          overlayBlur: "small",
          accentColorForeground: "white",
        })}
        modalSize="compact"
      >
        <Component {...pageProps} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          draggable={false}
          pauseOnVisibilityChange
          closeOnClick
          pauseOnHover
          theme="dark"
          toastStyle={{ backgroundColor: "#333", color: "white" }}
        />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
