import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { contractAddresses, donSharkyAbi } from "../../web3Constants";

function MintPage() {
  const { address, isConnected } = useAccount();
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mintedText, setMintedText] = useState("");

  const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
  const CONTRACT_ADDRESS = contractAddresses[CHAIN_ID].DonSharky[0];

  const mintNFT = async (event) => {
    event.preventDefault();
    if (isConnected) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        donSharkyAbi,
        signer
      );
      const nftAmount = event?.target[0]?.value;
      try {
        setLoading(true);
        connectedContract.on("NftMinted", async (tokenId) => {
          setLoading(false);
          setMintedText(
            `<a href="https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}" target="_blank">Has minteado ${nftAmount} Don Sharky NFT, míralo en Opensea!</a>`
          );
        });
        let nftTxn = await connectedContract.mint(nftAmount);
        await nftTxn.wait(1);
        toast.success(`Don Sharky NFT Minteado!`);
      } catch (error) {
        setLoading(false);
        toast.error("Error al mintear Don Sharky NFT");
      }
    }
  };

  useEffect(() => {
    setWalletConnected(isConnected);
  }, [isConnected]);

  return (
    <div className="App">
      <div className="mint-container">
        <div className="header-container">
          <p className="header gradient-text">Don Sharky NFT</p>
          {!walletConnected ? (
            <div className="btn-box">
              <ConnectButton
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
                variant="outline"
              />
            </div>
          ) : (
            <div className="btn-box">
              <form onSubmit={mintNFT} autoComplete="off" className="mint-form">
                <input type="number" min="1" defaultValue="1" required />
                <button type="submit" className="mint-button">
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  Mint NFT
                </button>
              </form>
              {mintedText && mintedText !== "" && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: mintedText,
                  }}
                  className="sub-text-2 mt-5"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MintPage;
