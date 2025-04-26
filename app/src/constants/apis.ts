
const BASE_URL=process.env.NEXT_PUBLIC_API_URL

export const AUTH={
    REGISTER: `${BASE_URL}/register`,
    LOGIN: `${BASE_URL}/login`,
    VERIFY:(token:string, code:string)=> `${BASE_URL}/registration/confirm/${token}?code=${code}`,
    REFRESH_TOKEN:`${BASE_URL}/refresh-token`,
}