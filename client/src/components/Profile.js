import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import avatar from '../assets/profile.png'
import toast, { Toaster } from 'react-hot-toast'
import { useFormik } from 'formik'
import { validateProfile } from '../helper/validate'
import { useAuthStore } from '../store/store'
import convertToBase64 from '../helper/convert'
import useFetch from '../hooks/fetch.hook'
import { updateUser } from '../helper/helper'

import styles from '../styles/Username.module.css'
import extend from '../styles/Profile.module.css'

export default function Profile() {

  const navigate = useNavigate()

  const [file, setFile] = useState();

  const [{ isLoading, apiData, serverError }] = useFetch()

  /** validate only when the submit butten is clicked */
  const formik = useFormik(
    {
      initialValues: {
        firstName: apiData?.firstName || '',
        lastName: apiData?.lastName || '',
        email: apiData?.email || '',
        mobile: apiData?.mobile || '',
        address: apiData?.address || ''
      },
      enableReinitialize: true,
      validate: validateProfile,
      validateOnBlur: false,
      validateOnChange: false,
      onSubmit: async values => {
        values = await Object.assign(values, { profile: file || apiData?.profile || '' })
        let updatePromise = updateUser(values)
        toast.promise(updatePromise, {
          loading: 'Updating...',
          success: <b>Update successful</b>,
          error: <b>Couldn't update</b>
        })
        console.log(values)
      }
    }
  )

  const onUpload = async event => {
    const base64 = await convertToBase64(event.target.files[0]);
    setFile(base64);

  }

  /** logout handler function */
  function userLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  if (isLoading) return <h1 className='text-2xl font-bold'>is loading...</h1>
  if (serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

  return (
    <div className='container mx-auto'>

      <Toaster position='top-center' reverseOrder={false} />

      <div className='flex justify-center items-center h-screen'>
        <div className={`${styles.glass} ${extend.glass}`} style={{width: "45%"}}>
          <div className='title flex flex-col items-center'>
            <h4 className='text-5xl font-bold'>Profile</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>You can update the details.</span>
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
            <div className='profile flex justify-center py-4'>
              <label htmlFor='profile'>
                <img src={apiData?.profile || file || avatar} className={`${styles.profile_img} ${extend.profile_img}`} alt="avater"/>
              </label>

              <input onChange={onUpload} type='file' id='profile' name='profile' />
            </div>

            <div className='textbox flex flex-col items-center gap-6'>
              <div className='name flex w-3/4 gap-10'>
                <input {...formik.getFieldProps('firstName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='First Name*' />  
                <input {...formik.getFieldProps('lastName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Last Name*' />  
              </div>

              <div className='name flex w-3/4 gap-10'>
                <input {...formik.getFieldProps('mobile')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Mobile Number' />  
                <input {...formik.getFieldProps('email')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Email*' />  
              </div>
              
              <input {...formik.getFieldProps('address')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Address' />  
              <button className={styles.btn} type="submit">Register</button>
              
            </div>

            <div className='text-center py-4'>
              <span className='text-gray-500'>Come back later?  <Link onClick={userLogout} className='text-red-500' to="/">logout now</Link></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
