import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
// Constants
const TWITTER_HANDLE = "chrisCompiled";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x5A51F295462FAa063aAb6240A33f5ef340e44233";
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/`;
const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintedNFTs, setMintedNFTs] = useState(null);
  const [loading, setLoader] = useState(false);
  // let chainId = await ethereum.request({ method: "eth_chainId" });
  // console.log("connected to chain" + chainId);
  // // STRING, HEX CODE OF THE CHAINiD OF THE RINKEBEY TEST NETWORK
  // CONST rinkebyChainId = "0x4";
  // if (chainId != rinkebyChainId){
  //   alert( "You are not connected to the Rinkeby Test Network!")
  // }

  const checkIfWalletIsConnected = async () => {
    // first make sure we have access to window.ethereum
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("connected to chain" + chainId);
    // STRING, HEX CODE OF THE CHAINiD OF THE RINKEBEY TEST NETWORK
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log(" We have the ethereum object", ethereum);
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      //set up listener. This is for the case where a user comes to our site.
      // and already had their wallet connected + authorized
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };
  //implement connect wallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      //method to request access to account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // print public address once we authorize metamask

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      //set up listener! This is for first-time user
      // and connected wallet for the first time
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };
  //set up listener
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        //This is the Magic Sauce
        // This will essentially "capture" our event when our contract throws it.
        // if you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setMintedNFTs(tokenId.toNumber());
          alert(
            `hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 minutes to show up on openSea. Here's a link: ${OPENSEA_LINK}${tokenId.toNumber()}}`
          );
        });
        console.log("Setup event Listener!");
      } else {
        console.log("Ethereum object doesn't exists");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const askContractToMintNft = async () => {
    setLoader(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        // let totalNFTS = await connectedContract.getAvailableCount();
        // setMintedNFTs(totalNFTS);
        console.log("Going to pop wallet now to pay gas....");
        let nftTxn = await connectedContract.MakeAnEpicNFT();
        console.log("Mining ... please wait.", nftTxn.events);
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https;//rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
    setLoader(false);
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  // // Render Methods
  // const renderNotConnectedContainer = () => (
  //   <button className="cta-button connect-wallet-button">
  //     Connect to Wallet
  //   </button>
  // );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {/* {renderNotConnectedContainer()} */}
          {currentAccount === "" ? (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button"
            >
              Connect to Wallet
            </button>
          ) : (
            <>
              <button
                onClick={askContractToMintNft}
                className="cta-button connect-wallet-button"
              >
                Mint NFT
              </button>
              {mintedNFTs ? (
                <h2 style={{ color: "white" }}>
                  {mintedNFTs}/{TOTAL_MINT_COUNT}
                </h2>
              ) : null}
            </>
          )}
          {loading ? (
            <>
              <h2 style={{ color: "white" }}>loading</h2>
              <Loader
                type="Puff"
                color="#00BFFF"
                height={100}
                width={100}
                // timeout={3000} //3 secs
              />
            </>
          ) : null}
          <button
            className="cta-button connect-wallet-button"
            ahref=" https://testnets.opensea.io/assets/0x5A51F295462FAa063aAb6240A33f5ef340e44233/"
            target="_blank"
          >
            NFT Collection
          </button>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
