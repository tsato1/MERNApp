import axios from 'axios'

axios.defailts.baseURL = process.env.REACT_APP_SERVER_DOMAIN

/** make api requests */

/** authentication */
export async function authenticate(username) {
    try {
        return await axios.post('/api/username', { username })
    }
    catch(error) {
        return {error: "Username doesn't exists"}
    }
}

/** get user details */
export async function getUser({ username }) {
    try {
        const { data } = await axios.get(`/api/user/${username}`)
        return { data }
    }
    catch(error) {
        return { error: "Password doesn't match" }
    }
}

/** register user */
export async function registerUser(credentials) {
    try {
        const {data: {msg}, status} = await axios.post('/api/register', credentials)

        let { username, email } = credentials

        /** send mail */
        if (status === 201) {
            await axios.post('/api/registerMail', { username, userEmail: email, text: msg })
        }

        return Promise.resolve(msg)
    }
    catch(error) {
        return Promise.reject({ error })
    }
}

/** login */
export async function verifyPassword({ username, password }) {
    try {
        if (username) {
            const { data } = await axios.post('/api/login', { username, password })
            return Promise.resolve({ data })
        }
    }
    catch (error) {
        return Promise.reject({error: "Password doesn't match"})
    }
}

/** update user */
export async function updateUser(response) {
    try {
        const token = await localStorage.getItem('token')
        const data = await axios.put('/api/updateuser', response, { headers: { "Authorization": `Bearer ${token}` }})
        return Promise.resolve({ data })
    }
    catch (error) {
        return Promise.reject({ error: "Couldn't update profile"})
    }
}

/** generate otp */
export async function generateOTP(username) {
    try {
        const { data: { code }, status } = await axios.get('/api/generateOTP', { params: { usernmae } })
        
        /** send email with otp */
        if (status === 201) {
            let { data: { email } } = await getUser({ username })
            let text = `Your recovery OTP is ${code}`
            await axios.post('/api/registerMail', { username, userEmail: email, text, subject: "Password recovery" })
        }

        return Promise.resolve(code)
    }
    catch(error) {
        return Promise.reject({error})
    }
}

/** verify OTP */
export async function verifyOTP({ username, code }){
    try {
       const { data, status } = await axios.get('/api/verifyOTP', { params : { username, code }})
       return { data, status }
    } catch (error) {
        return Promise.reject(error);
    }
}

/** reset password */
export async function resetPassword({ username, password }){
    try {
        const { data, status } = await axios.put('/api/resetPassword', { username, password });
        return Promise.resolve({ data, status})
    } catch (error) {
        return Promise.reject({ error })
    }
}