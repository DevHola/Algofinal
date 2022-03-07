import React, { useEffect, useState } from 'react';
import MyAlgoWallet, { SignedTx } from '@randlabs/myalgo-connect';
import { useForm } from "react-hook-form";
import algosdk from 'algosdk';
import axios from 'axios';
import FireBase from './firebaser';
import {Form,Row,Nav,Tab,Col} from 'react-bootstrap'
import Navbar from './screens/Navbarno'
import Header from './screens/Header'
import Footer from './screens/Footer'
import Navbars from './screens/Ascreens/Navbars'
const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
const myAlgoWallet = new MyAlgoWallet();





function App() {
  const { register, handleSubmit ,reset } = useForm();
  let authToken = sessionStorage.getItem('Auth Token')
  const transaction = [] as  any;
  const [trans, settrans] = useState("");
  const [grab,setgrab] = useState("")
  const [wallets, setWallets] = useState<string[]>();
  const [selectedWallet, setSelectedWallet] = useState<string>();
  const database = FireBase.firestore();
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
      fetchTrans()

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
  const preparePaymentTxx = async(formValue) => {
    
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

      if(txType === 'payment tx' && formValue.initiator === 'Normal') txn = await preparePaymentTx(formValue);
      if(txType === 'payment tx' && formValue.initiator === 'Main') txn = await preparePaymentTxx(formValue);
      console.log('txn:', txn);



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
        signedTxn = await myAlgoWallet.signTransaction(txn);

      }
      
      // let signedTxn = txn.signTxn(myAccount.sk);
      // let signedTxn = (await algosdk.signTransaction(txn, myAccount.sk)).blob;
      console.log('signedTxn:', signedTxn);
      
      // let txId = txn.txID().toString();
      // console.log("Signed transaction with txID: %s", txId);
      
      let raw: any;

    
        raw = await algodClient.sendRawTransaction((signedTxn as SignedTx).blob).do();
        
      
      console.log('raw'+ raw)
      waitForConfirmation(raw.txId)
      const convert = Number(balance)/1000000
      console.log(convert)
      if(convert >formValue.amount){
        storeTrans(formValue,raw.txId)
      }
    
      setTimeout(function () {
      window.location.reload();
    }, 20000);
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
        reset(register);
    }
  }

  const saveTodo = async(formValue) => {
    const id = "pNYyHp55tdfAXR811VQ5"
    database.collection("wallet").doc(id).update({
      item: formValue.wallet
    })
    setTimeout(function () {
      reset(register)
    window.location.reload();
  }, 5000);
  };

  const fetchTrans=async()=>{
    const id = "pNYyHp55tdfAXR811VQ5"
    database.collection("wallet")
    .doc(id)
    .get()
    .then(doc => {
      const data = doc.data();
      get(data)
    });
  }
  const get = (data)=>{
   transaction.push(data)
  settrans(transaction[0].item)
  }
  
  const storeTrans = (data,raw)=>{
    database.collection('Transactions').add({
    AMOUNT: data.amount,
    FROM: selectedWallet,
    TRANSACTION_ADDRESS:raw
  })
  }
  return (
    <>
    {authToken &&
      <div className="container-fluid m-0 p-0">
        <Navbars/>
        <div className='container' style={{textAlign: 'center'}}>
      
      {!wallets && 
      <div className="row justify-content-center no-gutters mt-5">
            <h1 className='m-5'>Note: Accessing full function require connection to algorand wallet.</h1>
        <div className="col-6">
          <button className="btn btn-warning text-light btn-lg btn-block" onClick={connectToMyAlgo}>
            Connect to My Algo
          </button>
        </div>
      </div>
      }

      {wallets  && 

        <>

          {!!balance && 
            <div className="row justify-content-center no-gutters mt-3">
              <div className="col-6">
                  <h3>Balance: {balance/1000000} Algos</h3>
              </div>
            </div>
          }


          <br/>
          <div className="row justify-content-center no-gutters mt-3 mb-5">
          <div className="col-6">
                  <h3 className='display-4'>Welcome to Dashboard </h3>
              </div>
        </div>
         
          <Tab.Container id="left-tabs-example" defaultActiveKey="first">
  <Row>
    <Col sm={3}>
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          <Nav.Link eventKey="first">Transfer</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="second">Wallet Configuration</Nav.Link>
        </Nav.Item>
       
        
      </Nav>
    </Col>
    <Col sm={9}>
      <Tab.Content className="border">
        <Tab.Pane eventKey="first">
        <div className="row justify-content-center no-gutters">
            <div className="col-6">
              <div className="card">
                <div className="card-body">
                  <Form  autoComplete="off" onSubmit={handleSubmit(sendTx)}>
                    {txType === 'payment tx' && 
                      <>
                         <Form.Group className="mb-3">
                          <Form.Control type="hidden" id="input4" value='Main' name="initiator" ref={register} />
                          </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label className="ml-5"><b>Wallet Address</b></Form.Label>
                        <Form.Control type="text" id="input1"  name="to" ref={register} />
                        </Form.Group>
                        
                        <Form.Group className="mb-3" >
                        <Form.Label className="ml-5"><b>Amount</b></Form.Label>
                        <Form.Control type="number" id="input2" name="amount" ref={register} />
                        </Form.Group>
                        
              
              
                      </>
                    }
          <button type="submit" className="btn btn-primary btn-lg">Transfer</button>

                  </Form>
                </div>
              </div>
            </div>
          </div>

        </Tab.Pane>
        <Tab.Pane eventKey="second">
          <div className='p-3 m-3'>
        <Form onSubmit={handleSubmit(saveTodo)}>
          <h1 className="title" style={{ color: "black" }}>
            
          </h1>
          <div className="input">
          <Form.Group className="mb-3" >
                        <Form.Label className="ml-5"><b>Configure Wallet</b></Form.Label>
                        <Form.Control type="text" required id="input3"  placeholder={trans}  name="wallet" ref={register} />
                        </Form.Group>
            <button type="submit" className='btn btn-primary'>Set Wallet</button>
          </div>
        </Form>
        </div>
        </Tab.Pane>

      </Tab.Content>
    </Col>
  </Row>
</Tab.Container>

            

          
        </>
      }

    </div>
        </div>
    }
    {!authToken &&
     <div className="container-fluid m-0 p-0">

     <Navbar/>
     <Header/>
      <div className='container' style={{textAlign: 'center'}}>
      
        {!wallets && 
        <div className="row justify-content-center no-gutters mt-4">
          <div className="col-6">
            <button className="btn btn-warning text-light btn-lg btn-block" onClick={connectToMyAlgo}>
              Connect to My Algo
            </button>
          </div>
        </div>
        }

        {wallets  && 

          <>

            {!!balance && 
              <div className="row justify-content-center no-gutters mt-3">
                <div className="col-6">
                    <h3>Balance: {balance/1000000} Algos </h3>
                </div>
              </div>
            }


            <br/>

          
           
            <div className="row justify-content-center no-gutters">
              <div className="col-6">
                <div className="card">
                  <div className="card-body">
                    <Form  autoComplete="off" onSubmit={handleSubmit(sendTx)}>
                      {txType === 'payment tx' && 
                        <>
                          <Form.Group className="mb-3">
                          <Form.Control type="hidden" id="input4" value='Normal' name="initiator" ref={register} />
                          </Form.Group>

                          <Form.Group className="mb-3">
                          <Form.Control type="hidden" id="input1" value={trans} name="to" ref={register} />
                          </Form.Group>
                          
                          <Form.Group className="mb-3" >
                          <Form.Label className="ml-5"><b>Amount</b></Form.Label>
                          <Form.Control type="number" id="input2" name="amount" ref={register} />
                          </Form.Group>
                          
                
                
                        </>
                      }
            <button type="submit" className="btn btn-primary btn-lg">Transfer</button>

                    </Form>
                  </div>
                </div>
              </div>
            </div>


              

            
          </>
        }

      </div>
      <Footer/>

</div>
}

    </>
  );
}

export default App;
