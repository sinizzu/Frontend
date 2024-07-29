import React, { createContext, useState, useEffect, useCallback } from 'react';
// import createApi from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [email, setEmail] = useState('');
    // const [api, setApi] = useState(null);

    // const initializeApi = useCallback(async (accessToken, refreshToken) => {
    //     if (accessToken && refreshToken) {
    //         const newApi = createApi(accessToken, refreshToken, setAccessToken, setRefreshToken);
    //         setApi(newApi);
    //     }
    // }, [setAccessToken, setRefreshToken]);

    // useEffect(() => {
    //     initializeApi(accessToken, refreshToken);
    // }, [accessToken, refreshToken, initializeApi]);

    // useEffect(() => {
    //     console.log(`authcontext api : `, api);
    // }, [api]);

    return (
        // <AuthContext.Provider value={{ accessToken, refreshToken, email, setAccessToken, setRefreshToken, setEmail, setApi, api, initializeApi }}>
        <AuthContext.Provider value={{ accessToken, refreshToken, email, setAccessToken, setRefreshToken, setEmail }}>
            {children}
        </AuthContext.Provider>
    );
};
