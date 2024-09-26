import axios from 'axios';

import requestInterceptor from './axios-jwt-refresh'

import {IStorage} from './axios-jwt-refresh/types'


const API_URL = "http://localhost:8000/api"

const api = axios.create({
    baseURL: API_URL
})

const Storage: IStorage  = {
    setTokens: (tokens) => {
        localStorage.setItem("ACCESS_TOKEN", tokens.accessToken)
        localStorage.setItem("REFRESH_TOKEN", tokens.refreshToken)
    },

    updateAccessToken: ({accessToken}) => {
        localStorage.setItem("ACCESS_TOKEN", accessToken)
    },

    removeTokens: () => {
        localStorage.removeItem("ACCESS_TOKEN")
        localStorage.removeItem("REFRESH_TOKEN")
    },

    getTokens: () => {
        return {
            accessToken: localStorage.getItem("ACCESS_TOKEN"),
            refreshToken: localStorage.getItem("REFRESH_TOKEN")
        }
    }
}

requestInterceptor({
    axiosInstance: api,
    tokenStorage: Storage,
    expiryKey: "exp",
    authHeaderName: "Authorization",
    tokenPrefix: "Bearer",
    getNewToken: async ({refreshToken}) => {
        const resp = await axios.post(`${API_URL}/token/refresh/`, {
            "refresh": refreshToken
        })
        const token = resp.data.access
        return token
    },
    onTokenFailure: ({tokenStorage, axiosConfig}) => {
        tokenStorage.removeTokens()
        window.location.reload()
    },
    onTokenSuccess: ({axiosConfig, accessToken}) => {
        console.log("Token successfully updated")
    
        if(axiosConfig.url == "/token/verify/" && accessToken){
            axiosConfig.data = {
                "token": accessToken
            }
        }
    }
})


export default api;
