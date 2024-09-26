import { Axios, AxiosRequestConfig } from "axios";

export interface IStorage {
    setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
    updateAccessToken: (token: { accessToken: string }) => void;
    removeTokens: () => void;
    getTokens: () => { accessToken: string | null; refreshToken: string | null }
}

export interface IRequestInterceptor {
    axiosInstance: Axios
    tokenStorage: IStorage
    getNewToken: (props: {refreshToken: string}) => Promise<string>
    onTokenFailure: (props: {tokenStorage: IStorage, axiosConfig: AxiosRequestConfig}) => void
    onTokenSuccess: (props: {axiosConfig: AxiosRequestConfig, accessToken: string}) => void
    authHeaderName?: string
    expiryKey?: string
    tokenPrefix?: string
}

export interface IHandleRequestToken extends Omit<IRequestInterceptor, 'axiosInstance'> {
    axiosConfig: AxiosRequestConfig
}
