import React from 'react'
import found from '../images/404.png'
import Navbarno from './Navbarno'
import './page.css'
export default function Pagenotfound() {
  return (
    <div className=' text-center'>
        <Navbarno/>
        <img src={found} className="img-fluid" alt='404' width="450" height="150px" ></img>
        <p className='pos'><b>THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST.</b></p>
    </div>
  )
}
