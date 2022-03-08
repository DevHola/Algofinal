import React,{useState} from 'react'
import { Modal } from 'react-bootstrap'
import { auth } from '../firebase';
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword,UserCredential,AuthError} from 'firebase/auth'
import './login.css'
export default function Loginmodal(props) {
  const { register, handleSubmit } =  useForm();
  const [error, setError] = useState<AuthError>();
  const [loggedInUser, setLoggedInUser] = useState<UserCredential>();
 
  const check = async (formValue) => {
    try {
       await signInWithEmailAndPassword(auth,formValue.email, formValue.password).then((response)=>{
        sessionStorage.setItem('Auth Token', response.user.refreshToken)
        //console.log(response.user)
        setLoggedInUser(response);
        window.location.reload();
       })
        
    } catch (err) {
      setError(err as AuthError);
    }
  }

  
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
      </Modal.Header>
      <Modal.Body>
      <form autoComplete="off" onSubmit={handleSubmit(check)} className='p-3 m-2'>

<h3>Log in</h3>

<div className="form-group">
    <label>Email</label>
    <input type="email" className="form-control" name="email" placeholder="Enter email"  id="input1"  ref={register} />
</div>

<div className="form-group">
    <label>Password</label>
    <input type="password" className="form-control" name="password" placeholder="Enter password" id="input2"  ref={register} />
</div>

<div className="form-group">
    <div className="custom-control custom-checkbox">
        <input type="checkbox" className="custom-control-input" id="customCheck1" />
        <label className="custom-control-label" htmlFor="customCheck1">Remember me</label>
    </div>
</div>

<button type="submit" className="btn btn-dark btn-lg btn-block">Sign in</button>

</form>
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
    </Modal>
  )
}
