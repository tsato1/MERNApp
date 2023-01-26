import toast from 'react-hot-toast'

/** validate login page username */
export async function validateUsername(values) {
    const errors = verifyUsername({}, values)

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
