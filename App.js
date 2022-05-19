import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  Button,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Sdk, MetaMaskWalletProvider, randomPrivateKey, NetworkNames, EnvNames, Env } from "etherspot";
import { ethers, Wallet } from "ethers";
import Web3Modal from "web3modal";

export default function App() {
  const [ethAmount, setEthAmount] = useState();
  const [walletAddress, setWalletAddress] = useState();
  const onChangeNumber = (text) => {
    setEthAmount(text);
  };
  const onChangeAddress = (text) => {
    setWalletAddress(text);
  };

  async function initSession(){
    if (!MetaMaskWalletProvider.detect()) {
      console.log("MetaMask not detected");
      return;
    }

    const walletProvider = await MetaMaskWalletProvider.connect();

    // Part  1
    const sdk = new Sdk(randomPrivateKey(), {
      env: EnvNames.TestNets,
      networkName: NetworkNames.Ropsten,
    });
  
    const { state } = sdk;
  
    await sdk.createSession();
    await sdk.computeContractAccount({sync: true});
    console.log('Smart wallet', state.account);
    console.log('Account balances ', await sdk.getAccountBalances());    

    const receiver = walletAddress;
    const amtInWei = ethers.utils.parseEther(String(ethAmount)) // fixed just for testing
    console.log(amtInWei);
    //this method will add the transaction to a batch, which has to be executed later.
    const transaction = await sdk.batchExecuteAccountTransaction({
      to: receiver,
      value: amtInWei,
    });
  
    await sdk.estimateGatewayBatch().then(async (result) => {
      console.log('Gas Estimation ', result.estimation);
      const hash = await sdk.submitGatewayBatch();
      console.log('Transaction submitted ', hash);
    })
    .catch((error) => {
      console.log('Transaction estimation failed with error ',error.message);
    });
  }
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeAddress}
        value={walletAddress}
        placeholder="Wallet Address"
        keyboardType="text"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeNumber}
        value={ethAmount}
        placeholder="Eth Amount"
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.button}
        disabled={!walletAddress && !ethAmount}
        onPress={initSession}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Submit
        </Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "80%",
    height: 44,
    padding: 8,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#793EF9",
    padding: 10,
    width: "80%",
    borderRadius: 5,
    height: 44,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
