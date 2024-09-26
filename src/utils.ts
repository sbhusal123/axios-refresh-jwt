import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';

import { IRequestInterceptor, IHandleRequestToken } from './types';

const isTokenExired = ({token, expiryKey}: {
    token: string,
    expiryKey: string
}) => {
    try {
        const payload : any = jwtDecode(token)
        const expiryTime = payload[`${expiryKey}`]
        return dayjs.unix(expiryTime).diff(dayjs()) < 1
    } catch(err) {
        return true
    }
}


const handleTokenRequest = async ({
    axiosConfig,
    tokenStorage,
    getNewToken,
    onTokenSuccess,
    onTokenFailure,
}: IHandleRequestToken ) => {
    const { refreshToken } = tokenStorage.getTokens()
    try {
        const token = await getNewToken({refreshToken: refreshToken ?? ""})
        tokenStorage.updateAccessToken({
            accessToken: token
        })
        onTokenSuccess({
            axiosConfig: axiosConfig,
            accessToken: token
        })
        return token
    } catch(ex){
        onTokenFailure({tokenStorage: tokenStorage, axiosConfig: axiosConfig})
        throw ex
    }
}

export const requestInterceptor = ({
    axiosInstance,
    getNewToken,
    onTokenFailure,
    onTokenSuccess,
    tokenStorage,
    expiryKey="exp",
    authHeaderName="Authorization",
    tokenPrefix="Bearer",
}: IRequestInterceptor) => {
    axiosInstance.interceptors.request.use(async (axiosConfig) => {
        const {accessToken, refreshToken} = tokenStorage.getTokens()
    
        if(accessToken && refreshToken) {
            let newToken = accessToken
            try {
                const accessTokenExpired = isTokenExired({
                    token: accessToken,
                    expiryKey
                });
                if (accessTokenExpired) {
                    newToken = await handleTokenRequest({
                        axiosConfig,
                        getNewToken,
                        onTokenFailure,
                        onTokenSuccess,
                        tokenStorage
                    });
                }
                axiosConfig.headers[`${authHeaderName}`] = `${tokenPrefix} ${newToken}`
            } catch (err) {
                return axiosConfig
            }
        }
        
        return axiosConfig;
    }, (error) => {
        return Promise.reject(error);
    });
}
