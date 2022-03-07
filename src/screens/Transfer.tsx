import React, { useEffect, useState } from 'react';
import MyAlgoWallet, { SignedTx } from '@randlabs/myalgo-connect';
import { useForm } from "react-hook-form";
import {Form,Row,Button,Col,Container,Card} from 'react-bootstrap'
import algosdk from 'algosdk';
import axios from 'axios';

const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
const myAlgoWallet = new MyAlgoWallet();

export default function Transfer() {
 
  const [wallets, setWallets] = useState<string[]>();
  const [selectedWallet, setSelectedWallet] = useState<string>();

  const [balance, setBalance] = useState<number>();
  const txType = 'payment tx'

  const [isTxArray, setIsTxArray] = useState(false);
  const [totalTxArrayEl, setTotalTxArrayEl] = useState(2);


  useEffect(() => {
    (async () => {

      if(!selectedWallet) return;

      let accountInfo = await algodClient.accountInformation(selectedWallet).do();
      const _balance = accountInfo.amount;
      setBalance(_balance);

    })();
  }, [selectedWallet]);

  
  
  const connectToMyAlgo = async() => {
    try {
      const accounts = await myAlgoWallet.connect();
      

      const _wallets = accounts.map(account => account.address);
      setWallets(_wallets);
      setSelectedWallet(_wallets[0]);

      
    } catch (err) {
      console.error(err);
    }
  }

  

  const preparePaymentTx = async(formValue) => {
    
    let txn = await algodClient.getTransactionParams().do();

    txn = {
      ...txn,
      ...formValue,
      fee: 1000,
      flatFee: true,
      from: selectedWallet,
      type: 'pay',
      amount: +formValue.amount*1000000,
      // note: formValue.note && algosdk.encodeObj(formValue.note)
    };

    if(txn.note) txn.note = new Uint8Array(Buffer.from(formValue.note));

    return txn;
  }









  const sendTx = async(formValue) => {
    try {

      Object.keys(formValue).forEach(key => {
        if(!formValue[key]) delete formValue[key];
      });

      let txn: any;

      if(txType === 'payment tx') txn = await preparePaymentTx(formValue);
      console.log('txn:', txn);


      // let txn = algosdk.makePaymentTxnWithSuggestedParams(selectedWallet, receiverAddress, (amount as number)*1000000, undefined, undefined, params);
      // console.log('txn:', txn);
    

      let signedTxn: SignedTx | SignedTx[];

      if(formValue.tealSrc) {
        const {result} = (await axios.post(
          "https://api.algoexplorer.io/v2/teal/compile",
          formValue.tealSrc,
          {headers: {'Content-Type': 'Content-Type: text/plain'}})
        ).data;
        console.log(result);

        const program = new Uint8Array(Buffer.from(result, 'base64'));
        // const program = Uint8Array.from([1, 32, 1, 0, 34]);

        const lsig = algosdk.makeLogicSig(program);

        lsig.sig = await myAlgoWallet.signLogicSig(program, selectedWallet as string);

        // create logic signed transaction.
        signedTxn = algosdk.signLogicSigTransaction(txn, lsig);


      } else {
        console.log('isTxArray:', isTxArray);

        let txArr = [] as any;

        if(isTxArray) {
          for(let i = 0; i< totalTxArrayEl; i++) {
            txArr.push({...txn, firstRound: txn.firstRound + i });
          }

          const groupID = algosdk.computeGroupID(txArr)

          for (let i = 0; i < totalTxArrayEl; i++) {
            txArr[i].group = groupID;
          }

          console.log(txArr);
        }

        signedTxn = (await myAlgoWallet.signTransaction(isTxArray? txArr : txn));

      }
      
      // let signedTxn = txn.signTxn(myAccount.sk);
      // let signedTxn = (await algosdk.signTransaction(txn, myAccount.sk)).blob;
      console.log('signedTxn:', signedTxn);
      
      // let txId = txn.txID().toString();
      // console.log("Signed transaction with txID: %s", txId);
      
      
      let raw: any;

      if(isTxArray) {
        (signedTxn as SignedTx[]).forEach(st => {
          console.log(algosdk.decodeObj(st.blob));
        });

        raw = await algodClient.sendRawTransaction((signedTxn as SignedTx[]).map(s => s.blob)).do();

      } else {
        raw = await algodClient.sendRawTransaction((signedTxn as SignedTx).blob).do();
        
      }
      
      console.log('raw:',raw);
      waitForConfirmation(raw.txId);


      
    } catch (err) {
      console.error(err); 
    }
  }



  const waitForConfirmation = async (txId) => {
    let status = (await algodClient.status().do());
    let lastRound = status["last-round"];
    while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        console.log('pendingInfo:', pendingInfo);

        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
            //Got the completed Transaction
            console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
            break;
        }
        lastRound++;
        await algodClient.statusAfterBlock(lastRound).do();
    }
  }
return (
<Container className="bg-white">
    <Row>
      < Col className="text-center mb-3 mt-3">
  <Button variant="warning" size="lg" onClick={connectToMyAlgo}>
    Connect My Wallet
  </Button>
  <Button variant="warning" size="lg" onClick={Transfer}>
    Connect My Wallet
  </Button>
  </Col>
</Row>
<Container className="m-5 mt-0 align-items-center h-50"  >
<Card className="p-2  shadow-sm align-items-center" >
    <Form style={{ width: '18rem' }} >
    <Form.Group className="mb-3" controlId="formBasicEmail">
      <Form.Label className="ml-5"><b>Amount</b></Form.Label>
      <Form.Control type="text" placeholder="Enter Amount" />
    </Form.Group>
  <Button variant="warning" type="submit">
      Transfer</Button>
  </Form>
  </Card>
  </Container>
  </Container>
  )
}
