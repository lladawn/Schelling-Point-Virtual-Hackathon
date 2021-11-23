import React, { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";

import ProtectedRoute from "./utils/ProtectedRoute";

import Web3Modal from "web3modal";
import web3 from "./ethereum/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

// const JorrToken = require("../ethereum/JorrToken");
import JorrToken from "./ethereum/JorrToken";
import Segment from "./pages/Segment";
const axios = require("axios");

const infuraId =
  // "https://mainnet.infura.io/v3/97c2d52095a84da7a0b710a8daa16acf";
  "https://rinkeby.infura.io/v3/97c2d52095a84da7a0b710a8daa16acf";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: infuraId, // required
    },
  },
};

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});
let provider;

const App = () => {
  const [account, setaccount] = useState("");

  const [gold, setGold] = useState(false);
  const [silver, setSilver] = useState(false);
  const [bronze, setBronze] = useState(false);

  const onConnectWallet = async () => {
    console.log("connecting wallet...");
    console.log("cached provider", web3Modal.cachedProvider);
    try {
      provider = await web3Modal.connect();
    } catch (err) {
      console.log("Could not get a wallet connection", err);
      return;
    }
    web3.setProvider(provider);
    const accounts = await web3.eth.getAccounts();
    setaccount(accounts[0]);
  };

  const onDisconnect = async (e) => {
    e.preventDefault();

    console.log(
      "cached provider before provider.close(): ",
      web3Modal.cachedProvider
    );
    console.log("Killing the session", web3.currentProvider);
    console.log("web3.givenProvider", web3.givenProvider);

    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }

    console.log(
      "cached provider after provider.close(): ",
      web3Modal.cachedProvider
    );
    web3Modal.clearCachedProvider();
    console.log("cached provider after clear: ", web3Modal.cachedProvider);
    provider = null;
    setaccount("");
    window.location.reload();
  };

  useEffect(() => {
    const run = async () => {
      try {
        setGold(false);
        setSilver(false);
        setBronze(false);
        const accounts = await web3.eth.getAccounts();
        // setaccount(account[0]);

        const userAddress = accounts[0];
        // "0x6ff9c8ed337de934e46e773f61a1a3369617c3ce";
        //   "0x5908bfd84673974ddb8b6688501a53ac5fc92b6b";
        const balance = await JorrToken.methods
          .balanceOf(userAddress.toString())
          .call();

        for (let i = 0; i < balance; i++) {
          const tokenId = await JorrToken.methods
            .tokenOfOwnerByIndex(userAddress, i)
            .call();

          const url =
            // `https://api.opensea.io/api/v1/asset/0x2E9983b023934e72e1E115Ab6AEbB3636f1C4Cbe/${tokenId}/`;
            `https://rinkeby-api.opensea.io/api/v1/asset/0x002aF40A6eB3C688612184C51500b97C1b89dfFC/${tokenId}/`;
          const { data } = await axios.get(url);

          await data.traits.map((trait) => {
            //   console.log(trait);
            if (trait.trait_type === "Level") {
              console.log(trait.value);
              if (trait.value === "Gold") setGold(true);
              else if (trait.value === "Silver") setSilver(true);
              else if (trait.value === "Bronze") setBronze(true);
            }
            return 0;
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    run();
  }, [account]);

  useEffect(() => {
    async function listenMMAccount() {
      try {
        window.ethereum.on("accountsChanged", async function () {
          // Time to reload your interface with accounts[0]!
          const account = await web3.eth.getAccounts();
          setaccount(account[0]);
          // accounts = await web3.eth.getAccounts();
          console.log(account);
          setGold(false);
          setSilver(false);
          setBronze(false);
        });
      } catch (err) {
        console.log("Browser wallet not installed!");
      }
    }

    listenMMAccount();
  }, []);

  useEffect(() => {
    // alert("Connect to mainnet!");
    onConnectWallet();
  }, []);

  return (
    <div>
      <Header
        account={account}
        onConnectWallet={onConnectWallet}
        onDisconnect={onDisconnect}
        level={{ gold: gold, silver: silver, bronze: bronze }}
      />
      <Switch>
        <Route exact path="/" component={() => <Home />} />
        <ProtectedRoute
          level={gold}
          exact
          path="/gold"
          component={() => <Segment segment="Gold" />}
        />
        <ProtectedRoute
          level={silver}
          exact
          path="/silver"
          component={() => <Segment segment="Silver" />}
        />
        <ProtectedRoute
          level={gold}
          exact
          path="/bronze"
          component={() => <Segment segment="Bronze" />}
        />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
};

export default App;
