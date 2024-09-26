# Axios JWT Refresh

Simple npm package that lets you refresh your access token with axios Interceptor. Simple and Elegant.

**Npm:**

``npm i axios-refresh-jwt``

**Yarn:**

```yarn add axios-refresh-jwt```

## Usage:

### Define Storage Object:

Basically this storage object is used by `axios-jet-refresh` to store, retrive and update the tokens for api calls. If you're using typescript, consider creating a `Storage` object from ``IStorage`` type at ``axios-jwt-refresh/types``

**Storage Object**

```js
import {IStorage} from 'axios-jwt-refresh/types'


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
```

## API Client


**requestInterceptor** accepts following params:

- ``axiosInstance`` : actual axios instance.

- ``tokenStorage`` : token storage class. Method signature is as above. It must be of type: ``IStorage``

- ``onTokenSuccess`` : called when new token request succeds. ``axiosConfig, accessToken`` in a callback params.

- ``onTokenFailure`` : called when new token request fails. ``tokenStorage, axiosConfig`` in a callback params.

- ``getNewToken`` : async function that handles getting new token with `refreshToken`. Note that this mustn't be the call from ``axiosInstance`` to prevent the request looping.

- ``expiryKey`` expiry key in token payload, you can check the decoded token right [here](https://jwt.io/). If unset, default value is `exp`

- ``authHeaderName`` auth header to use for subscequent request, if unset default value is``Authorization``

- ``tokenPrefix`` token prefix string, if unset default value is ``Bearer``


```js
import axios from 'axios';

import requestInterceptor from 'axios-jwt-refresh'

const API_URL = "http://foo.bar/api"

const api = axios.create({
    baseURL: API_URL
})


requestInterceptor({
    axiosInstance: api, // axios instance
    tokenStorage: Storage, // youe prefered storage, IStorage type.
    expiryKey: "exp", // default, optional
    authHeaderName: "Authorization", // default, optional
    tokenPrefix: "Bearer", // defauly, optional
    getNewToken: async ({refreshToken}) => { // must be instantiated from axios to prevent infinite loop
        const resp = await axios.post(`${API_URL}/token/refresh/`, {
            "refresh": refreshToken
        })
        const token = resp.data.access
        return token
    },
    onTokenFailure: ({tokenStorage, axiosConfig}) => { // called when refreshig token fails
        tokenStorage.removeTokens()
        window.location.reload()
    },
    onTokenSuccess: ({axiosConfig, accessToken}) => { // called when obaining a token succeds
        console.log("Token successfully updated")
    
        if(axiosConfig.url == "/token/verify/" && accessToken){
            axiosConfig.data = {
                "token": accessToken
            }
        }
    }
})


export default api;
```
