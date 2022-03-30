import React, { useEffect, useState } from "react";
import MyAlgoWallet, { SignedTx } from "@randlabs/myalgo-connect";
import { useForm } from "react-hook-form";
import algosdk from "algosdk";
import "./home.css";
import ReactDatatable from "@ashvin27/react-datatable";
import axios from "axios";
import FireBase from "../firebaser";
import { Form, Row, Nav, Tab, Col } from "react-bootstrap";
import Navbar from "./Navbarno";
import Navbarconfirm from "./Navbarconfirm";
import Header from "./Header";
import Footer from "./Footer";
import Navbars from "./Ascreens/Navbars";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const algodClient = new algosdk.Algodv2("", "https://api.algoexplorer.io", "");
const myAlgoWallet = new MyAlgoWallet();
//https://api.algoexplorer.io -- mainnet https://api.testnet.algoexplorer.io
toast.configure();

function Home() {
  const { register, handleSubmit, reset } = useForm();
  let authToken = sessionStorage.getItem("Auth Token");
  const transaction = [] as any;
  const [show, setshow] = useState(false);
  const all = [] as any;
  const [alldata, setalldata] = useState(all);
  const [trans, settrans] = useState("");
  const [wallets, setWallets] = useState<string[]>();
  const [selectedWallet, setSelectedWallet] = useState<string>();
  const database = FireBase.firestore();
  const [balance, setBalance] = useState<number>();
  const [Converterrate, setConverterrate] = useState<number>();
  const txType = "payment tx";
  useEffect(() => {
   // fetchdata();
  });

  useEffect(() => {
    //fetchTrans();
  });

  useEffect(() => {
    (async () => {
      if (!selectedWallet) return;

      let accountInfo = await algodClient
        .accountInformation(selectedWallet)
        .do();
      const _balance = accountInfo.amount;
      console.log(_balance)
      setBalance(_balance);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  const handleConvert = (e) => {
    const c = e.target.value / 1000;
    setConverterrate(c);
  };
  const getfromnav = (data) => {
    setshow(data);
    console.log(data);
  };

  const columns = [
    {
      key: "FROM",
      text: "FROM",
      sortable: true,
    },
    {
      key: "AMOUNT",
      text: "AMOUNT",
      sortable: true,
    },

    {
      key: "TRANSACTION_ADDRESS",
      text: "TRANSACTION_ADDRESS",
      sortable: true,
    },
  ];
  const config = {
    page_size: 10,
    length_menu: [10, 20, 50],
    show_filter: true,
    show_pagination: true,
    filename: "Transaction",
    button: {
      excel: true,
      print: true,
      csv: true,
    },
  };

  const connectToMyAlgo = async () => {
    try {
      const accounts = await myAlgoWallet.connect();

      const _wallets = accounts.map((account) => account.address);
      setWallets(_wallets);
      setSelectedWallet(_wallets[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const preparePaymentTx = async (formValue) => {
    let txn = await algodClient.getTransactionParams().do();

    txn = {
      ...txn,
      ...formValue,
      fee: 1000,
      flatFee: true,
      from: selectedWallet,
      type: "pay",
      amount: +formValue.amount * 1000000,
      // note: formValue.note && algosdk.encodeObj(formValue.note)
    };

    if (txn.note) txn.note = new Uint8Array(Buffer.from(formValue.note));

    return txn;
  };
  const preparePaymentTxx = async (formValue) => {
    let txn = await algodClient.getTransactionParams().do();

    txn = {
      ...txn,
      ...formValue,
      fee: 1000,
      flatFee: true,
      from: selectedWallet,
      type: "pay",
      amount: +formValue.amount * 1000000,
    };

    if (txn.note) txn.note = new Uint8Array(Buffer.from(formValue.note));

    return txn;
  };

  const sendTx = async (formValue) => {
    // const convert = balance/1000000
    console.log(formValue.amount);
    //if(convert >formValue.amount){
    try {
      Object.keys(formValue).forEach((key) => {
        if (!formValue[key]) delete formValue[key];
      });

      let txn: any;

      if (txType === "payment tx" && formValue.initiator === "Normal")
        txn = await preparePaymentTx(formValue);
      if (txType === "payment tx" && formValue.initiator === "Main")
        txn = await preparePaymentTxx(formValue);

      let signedTxn: SignedTx | SignedTx[];

      if (formValue.tealSrc) {
        const { result } = (
          await axios.post(
            "https://api.algoexplorer.io/v2/teal/compile", //https://api.testnet.algoexplorer.io/v2/transactions/params //https://api.testnet.algoexplorer.io/v2/transactions
            formValue.tealSrc,
            { headers: { "Content-Type": "Content-Type: text/plain" } }
          )
        ).data;
        // console.log(result);

        const program = new Uint8Array(Buffer.from(result, "base64"));

        const lsig = algosdk.makeLogicSig(program);

        lsig.sig = await myAlgoWallet.signLogicSig(
          program,
          selectedWallet as string
        );

        // creation of  logic signed transaction.
        signedTxn = algosdk.signLogicSigTransaction(txn, lsig);
      } else {
        //console.log('isTxArray:', isTxArray);
        signedTxn = await myAlgoWallet.signTransaction(txn);
      }
      let raw: any;

      raw = await algodClient
        .sendRawTransaction((signedTxn as SignedTx).blob)
        .do();

      // waitForConfirmation(raw.txId)
      // Converting total balance to number for computation
      waitForConfirmation(raw.txId);
      storeTrans(formValue, raw.txId);

      notify();
      reset(register);
      setTimeout(function () {
        window.location.reload();
      }, 10000);
    } catch (err) {
      reset(register);
      toast("Transaction failed to process");
    }
    // }else{
    //toast("Over-Spending detected. !Amount Greater than balance")
    // }
  };

  // Processing Transaction
  const waitForConfirmation = async (txId) => {
    let status = await algodClient.status().do();
    let lastRound = status["last-round"];
    while (true) {
      const pendingInfo = await algodClient
        .pendingTransactionInformation(txId)
        .do();

      if (
        pendingInfo["confirmed-round"] !== null &&
        pendingInfo["confirmed-round"] > 0
      ) {
        //Got the completed Transaction
        console.log(
          "Transaction " +
            txId +
            " confirmed in round " +
            pendingInfo["confirmed-round"]
        );
        break;
      }
      lastRound++;
      await algodClient.statusAfterBlock(lastRound).do();
      reset(register);
    }
  };
  // Update Wallet Configuration
  const saveTodo = async (formValue) => {
    const id = "pNYyHp55tdfAXR811VQ5";
    database.collection("wallet").doc(id).update({
      item: formValue.wallet,
    });
    walletset();
    setTimeout(function () {
      reset(register);
      window.location.reload();
    }, 5000);
  };
  // Fetch defined wallet address
  const fetchTrans = async () => {
    const id = "pNYyHp55tdfAXR811VQ5";
    database
      .collection("wallet")
      .doc(id)
      .get()
      .then((doc) => {
        const data = doc.data();
        get(data);
        console.log(data);
      });
  };
  const get = (data) => {
    transaction.push(data);
    settrans(transaction[0].item);
  };
  // Store Transaction after successfully sending algorand to the algorand system
  const storeTrans = (data, raw) => {
    database.collection("Transactions").add({
      AMOUNT: data.amount,
      FROM: selectedWallet,
      TRANSACTION_ADDRESS: raw,
    });
  };

  const fetchdata = async () => {
    const response = database.collection("Transactions");
    const data = await response.get();
    getall(data);
  };

  const notify = () =>
    toast(
      "Transfer Processing. Page reload initating on Tranasction Completed"
    );
  const walletset = () => toast("Wallet Configured");

  const getall = (data) => {
    data.docs.forEach((item) => {
      all.push(item.data());
    });
    setalldata(all);
  };
  return (
    <>
      {authToken && (
        <div
          className="container-fluid m-0 p-0 mb-5 text-white"
          style={{ height: "70px" }}
        >
          <Navbars data={getfromnav} />
          <div className="container" style={{ textAlign: "center" }}>
            <>
              <br />
              <div className="row justify-content-center no-gutters mt-3 mb-5">
                <div className="col-6"></div>
              </div>
              {show === true && (
                <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                  <Row>
                    <Col sm={3}>
                      <Nav variant="pills" className="flex-column">
                        <Nav.Item>
                          <Nav.Link eventKey="first">
                            Wallet Configuration
                          </Nav.Link>
                        </Nav.Item>
                      </Nav>
                    </Col>
                    <Col sm={9}>
                      <Tab.Content className="border">
                        <Tab.Pane eventKey="first">
                          <div className="p-3 m-3">
                            <Form onSubmit={handleSubmit(saveTodo)}>
                              <div className="input">
                                <Form.Group className="mb-3">
                                  <Form.Label className="ml-5">
                                    <b>Configure Wallet</b>
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    required
                                    id="input3"
                                    placeholder={trans}
                                    name="wallet"
                                    ref={register}
                                  />
                                </Form.Group>
                                <button
                                  type="submit"
                                  className="btn btn-primary"
                                >
                                  Set Wallet
                                </button>
                              </div>
                            </Form>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Col>
                  </Row>
                </Tab.Container>
              )}

              <hr className="mt-5"></hr>
              <h1 className="display-4 text-white ">All Transactions </h1>
              <hr className="temper"></hr>
              <div className="bg-white p-5 ">
                <ReactDatatable
                  config={config}
                  records={alldata}
                  columns={columns}
                />
              </div>
            </>
          </div>
        </div>
      )}
      {!authToken && (
        <div className="container-fluid m-0 p-0 moris">
          {!wallets && <Navbar />}
          {wallets && <Navbarconfirm />}
          {wallets && <hr className="text-white inca "></hr>}

          <Header />
          <div className="container" style={{ textAlign: "center" }}>
            {!wallets && (
              <div className="row justify-content-center no-gutters mt-4">
                <div className="col-6">
                  <button
                    className="btn green text-light btn-lg btn-block"
                    onClick={connectToMyAlgo}
                  >
                    Connect to My Algo
                  </button>
                </div>
              </div>
            )}

            {wallets && (
              <>
                {!!balance && (
                  <div className="row justify-content-center no-gutters mt-3 mb-4">
                    <div className="col-6">
                      {balance > 0 && (
                        <h3 className="text-white">
                          Balance: {balance / 1000000} Algos{" "}
                        </h3>
                      )}
                      {balance === 0 && (
                        <h3 className="text-white">
                          You currently have no Algorand in Your Wallet
                        </h3>
                      )}
                    </div>
                  </div>
                )}

                <br />
                <br></br>

                <div className="row justify-content-center no-gutters">
                  <div className="col-6">
                    <div className="card grn">
                      <div className="card-body">
                        <Form
                          autoComplete="off"
                          onSubmit={handleSubmit(sendTx)}
                        >
                          {txType === "payment tx" && (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Control
                                  type="hidden"
                                  id="input4"
                                  value="Normal"
                                  name="initiator"
                                  ref={register}
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Control
                                  type="hidden"
                                  id="input1"
                                  value={trans}
                                  name="to"
                                  ref={register}
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="ml-5">
                                  <b>Amount</b>
                                </Form.Label>
                                <Form.Control
                                  type="number"
                                  id="input2"
                                  name="amount"
                                  onChange={handleConvert}
                                  ref={register}
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="ml-5">
                                  <b>Trackdefi Token</b>
                                </Form.Label>
                                <Form.Control
                                  type="Number"
                                  id="input1"
                                  name="toget"
                                  value={Converterrate}
                                  ref={register}
                                  disabled
                                />
                              </Form.Group>
                            </>
                          )}
                          <button
                            type="submit"
                            className="btn  btn-lg bg-dark text-white"
                          >
                            Purchase
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}

export default Home;
