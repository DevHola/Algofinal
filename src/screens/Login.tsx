import React,{useState} from 'react'
import { auth } from '../firebase';
import { useNavigate,Navigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword,UserCredential,AuthError} from 'firebase/auth'
// import Navbar from './Navbarno'
import {Form,Container} from 'react-bootstrap'
import { toast } from 'react-toastify';
import './login.css'
import 'react-toastify/dist/ReactToastify.css';
export default function Login() {
    const { register, handleSubmit } =  useForm();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState<AuthError>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loggedInUser, setLoggedInUser] = useState<UserCredential>();
    const history = useNavigate();
    let authToken = sessionStorage.getItem('Auth Token')
    const check = async (formValue) => {
        try {
           await signInWithEmailAndPassword(auth,formValue.email, formValue.password).then((response)=>{
            sessionStorage.setItem('Auth Token', response.user.refreshToken)
            //console.log(response.user)
            setLoggedInUser(response);
            toast("Authentication Completed");
            history('/');
           })
            
        } catch (err) {
          setError(err as AuthError);
        }
      }
  return (
    <>
    {!authToken &&
      <div className='container loger'>
    <Container>
      <div className='row'>
      <div className="col-4 timer mt-5 d-none d-md-block"><h1 className="m-5 p-5 "><b>Trackdefi</b></h1>
      </div>
        <div className="col-sm p-3">
        <div className='col p-5 shadow turn mb-5'>
        <Form autoComplete="off" onSubmit={handleSubmit(check)}   className='pt-5'>
  <Form.Group className="mb-3" >
    <label className="p-2"><b>Email</b></label>
    <Form.Control type="email" className="form-control" name="email" placeholder="Enter email"  id="input1"  ref={register} />
  </Form.Group>

  <Form.Group className="mb-3" >
  <label className="p-2"><b>Password</b></label>
    <Form.Control type="password" className="form-control" name="password" placeholder="Enter password" id="input2"  ref={register} />
  </Form.Group>
  
  <button type="submit" className="btn col btn-dark btn-lg btn-block mb-5"><b>Sign in</b></button>
</Form>
        </div>
        </div>
</div>
</Container>
</div>
}
{authToken &&
<Navigate to="/"></Navigate>
}
</>
)
}
