import toast from 'react-hot-toast'
import { authenticate } from './helper'

/** validate login page username */
export async function validateUsername(values) {
    const errors = verifyUsername({}, values)

    // check for the user existance
    if (values.username) {
        const { status } = await authenticate(values.username) 

        if (status !== 200) {
            errors.exist = toast.error("User doesn't exist")
        }
    }

    return errors;
}

export async function validatePassword(values) {
    const errors = verifyPassword({}, values)

    return errors;
}

/** validate reset password */
export async function validateResetPassword(values) {
    const errors = verifyPassword({}, values)

    if (values.password !== values.confirm_password) {
        errors.exist = toast.error("New Password doesn't match the Password for confirmation.")
    }

    return errors;
}

export async function validateRegisterForm(values) {
    const errors = verifyUsername({} , values);
    verifyPassword(errors, values);
    verifyEmail(errors, values);
    return errors;
}

/** validate profile */
export async function validateProfile(values) {
    const errors = verifyEmail({}, values);
    return errors;
}

/* **************************************** */

/** validate username */
function verifyUsername(error = {}, values) {
    if (!values.username) { 
        error.username = toast.error('Username required!')
    }
    else if (values.username.includes(" ")) {
        error.username = toast.error('Invlaid username')
    }

    return error;
}

/** validate password */
function verifyPassword(error = {}, values) {
    
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (!values.password) { 
        error.password = toast.error('Password required!')
    }
    else if (values.password.includes(" ")) {
        error.password = toast.error('Invlaid password')
    }
    else if (values.password.length < 5) {
        error.password = toast.error('Password must be at least 5 characters long')
    }
    else if (!specialChars.test(values.password)) {
        error.password = toast.error('Password must have a special character')
    }

    return error;
}

/** validate email */
function verifyEmail(error = {}, values) {
    if (!values.email) {
        error.email = toast.error("Email required")
    }
    else if (values.email.includes(" ")) {
        error.email = toast.error("Invalid email")
    }
    // commenting out not to catch ethereal emails 
    // else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    //     error.email = toast.error("Invalid email")
    // }

    return error;
}
