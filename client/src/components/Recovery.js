import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { validatePassword } from '../helper/validate'
import { useAuthStore } from '../store/store'
import { generateOTP, verifyOTP } from '../helper/helper'

import styles from '../styles/Username.module.css'

export default function Recovery() {

  const navigate = useNavigate()

  const {username} = useAuthStore(state => state.auth)
  const [OTP, setOTP] = useState()

  useEffect(() => {
    console.log(OTP)
    generateOTP(username).then((OTP) => {
      if (OTP) {
        return toast.success('OTP has been sent')
      }
      return toast.error('Error while generating OTP')
    })
  }, [username])

  /** validate only when the submit butten is clicked */
  const formik = useFormik(
    {
      initialValues: {
        password: ''
      },
      validate: validatePassword,
      validateOnBlur: false,
      validateOnChange: false,
      // onSubmit: async values => {
      //   console.log(values)
      // }
    }
  )

  async function onSubmit(event)  {
    event.preventDefault()

    try {
      let {status} = await verifyOTP({ username, code: OTP})
   
      if (status === 201) {
        toast.success('Verify successfull ')
        return navigate('/reset')
      }
    }
    catch(error) {
      return toast.error('Wrong OTP. Check your email again')
    }
  }

  function resendOTP() {
    let sendPromise = generateOTP(username)

    toast.promise(sendPromise, {
      loading: 'Sending...',
      success: <b>OTP has been sent to your email</b>,
      error: <b>Couldn't send OTP</b>
    })

    // sendPromise.then(otp => {
    //   console.log(otp)
    // })
  }

  return (
    <div className='container mx-auto'>

      <Toaster position='top-center' reverseOrder={false} />

      <div className='flex justify-center items-center h-screen'>
        <div className={styles.glass}>
          <div className='title flex flex-col items-center'>
            <h4 className='text-5xl font-bold'>Recovery</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>Enter OTP to recover password</span>
          </div>

          <form className='pt-20' onSubmit={onSubmit}>

            <div className='textbox flex flex-col items-center gap-6'>

              <div className='input text-center'>
                <span className='py-4 text-sm text-left text-gray-500'>
                  Enter 6 digits OTP sent to your email address.
                </span>
                <input onChange={(event) => setOTP(event.target.value)} className={styles.textbox} type="password" placeholder='OTP' />
              </div>

              <button className={styles.btn} type="submit">Recover</button>

            </div>

          </form>

          <div className='text-center py-4'>
            <span className='text-gray-500'>Can't get OTP?  <button onClick={resendOTP} className='text-red-500'>Resend</button></span>
          </div>
        </div>
      </div>
    </div>
  )
}
