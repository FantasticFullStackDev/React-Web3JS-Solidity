import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import Web3 from 'web3';
import { STORAGE_ABI, STORAGE_ADDRESS } from './contracts/simpleStorage';
import { EARN_ABI, EARN_ADDRESS } from './contracts/earn';
import { EVB_ABI, EVB_ADDRESS } from './contracts/evb';
import detectEthereumProvider from '@metamask/detect-provider'

function App() {
  //----- classes ------
  const classes = useStyles();

  //----- Internal States -----
  const [account, setAccount] = useState(); // My account
  const [storage, setStorage] = useState(); // storage that the contract made
  const [earn, setEarn] = useState();
  const [evb, setEvb] = useState();
  const [value, setValue] = useState(); // The value that stored in the Storage
  const [num, setNum] = useState(); // Inputed value

  //----- Custom Functions -----
  // Set Inputed Value To the Storage
  const setValueToStorage = async () => {
    await storage.methods.set(num).send({from: account});
  }

  // Get Value From the Storage and Display on the Page
  const getValueFromStorage = async () => {
    var val = await storage.methods.get().call();
    setValue(val);
  }

  // Automatically Add Custom Tokens To Meta Mask
  const addToMM = async () => {
    const tokenAddress = await evb.methods.getPrintToken1().call();
    const tokenSymbol = 'EVB';
    const tokenDecimals = 18;
    const tokenImage = 'http://placekitten.com/200/300';

    const provider = await detectEthereumProvider();
    provider.sendAsync({
      method: 'metamask_watchAsset',
      params: {
        "type": "ERC20",
        "options": {
          "address": tokenAddress,
          "symbol": tokenSymbol,
          "decimals": tokenDecimals,
          "image": tokenImage,
        },
      },
      id: Math.round(Math.random() * 100000),
    }, (err, added) => {
      console.log('provider returned', err, added)
      if (err || 'error' in added) {
        console.log('ERROR : There was a problem adding the token.')
        return
      }
      console.log('Token Added.');
    })
  }

  const claim = () => {

  }

  //----- Lifecycle Events -----
  useEffect(() => {
    // Web3.js initiate
    async function load() {
      const web3 = new Web3(Web3.givenProvider || 'https://ropsten.infura.io/v3/e5f6b05589544b1bb8526dc3c034c63e');
      // const web3 = new Web3(Web3.givenProvider || 'https://rinkeby.infura.io/v3/11d2dfe1e20648a7a459f4ef5e57aa2f');
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
      // Instantiate smart contracts using ABI and address.
      setStorage(new web3.eth.Contract(STORAGE_ABI, STORAGE_ADDRESS));
      setEarn(new web3.eth.Contract(EARN_ABI, EARN_ADDRESS));
      setEvb(new web3.eth.Contract(EVB_ABI, EVB_ADDRESS));
    }

    load();
  }, []);

  return (
    <div>
      <h4> Your account is: {account} </h4>
      <hr/>
      <h2> Simple Storage Contract </h2>
      <input type='number' placeholder='number' onChange={(e) => setNum(e.target.value)} />
      <br/><br/>
      <button className={classes.button} onClick={setValueToStorage}>SET</button>
      <h4> The Value is : {value} </h4>
      <button className={classes.button} onClick={getValueFromStorage}>GET</button>
      <br/><br/>
      <hr/>
      <h2> Earn Everburn Contract </h2>
      <button className={classes.button} onClick={addToMM}>ADD To MM</button>
      <br/><br/>
      <button className={classes.button} onClick={claim}>CLAIM</button>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    width: 100,
    height: 50,
    backgroundColor: 'teal',
    borderRadius: 5,
    color: 'white'
  }
}))

export default App;
