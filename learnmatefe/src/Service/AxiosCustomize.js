import axios from 'axios';
import NProgress from 'nprogress';
import { isTokenExpired } from './decodeJWT.js';
import { store } from '../redux/store';


const instance = axios.create({
    baseURL: 'http://localhost:6060/',
    withCredentials: true,
});

// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        const state = store.getState();
        const accessToken = state.user.account.access_token;
        // if (accessToken && isTokenExpired(accessToken)) {
        //     window.location.href = '/signin';
        //     return Promise.reject(new Error('Access token expired'));
        // }

        if (accessToken) {
            config.headers['Authorization'] = 'Bearer ' + accessToken;
        }

        NProgress.start();
        return config;
    },
    function (error) {
        NProgress.done(); // Stop NProgress on request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        NProgress.done(); // Stop NProgress on successful response
        return response && response.data ? response.data : response;
    },
    function (error) {
        NProgress.done(); // Stop NProgress on response error

        if (error.response) {
            // Handle specific error cases
            if (error.response.data.errorCode === -999) {
                // store.dispatch(doLogout()); // Uncomment if using a logout action
                window.location.href = '/signin';
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
