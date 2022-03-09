import React,{useState} from 'react'
import { auth } from '../firebase';
import { useNavigate,Navigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword,UserCredential,AuthError} from 'firebase/auth'
import Navbar from './Navbarno'
import {Form,Container} from 'react-bootstrap'
import { toast } from 'react-toastify';
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
      <div>
    <Navbar/>
    <Container className='mt-5'>
      
    <Form autoComplete="off" onSubmit={handleSubmit(check)} style={{ width: '40rem' }}  className='pt-5 mt-5'>
      <h5 className='text-center mb-3 mt-3'>Login</h5>
  <Form.Group className="mb-3 mt-5" >
    <Form.Label>Email address</Form.Label>
    <Form.Control type="email" className="form-control" name="email" placeholder="Enter email"  id="input1"  ref={register} />
  </Form.Group>

  <Form.Group className="mb-3" >
    <Form.Label>Password</Form.Label>
    <Form.Control type="password" className="form-control" name="password" placeholder="Enter password" id="input2"  ref={register} />
  </Form.Group>
  <button type="submit" className="btn btn-dark btn-lg btn-block">Sign in</button>
</Form>
</Container>
</div>
}
{authToken &&
<Navigate to="/"></Navigate>
}
</>
)
}
