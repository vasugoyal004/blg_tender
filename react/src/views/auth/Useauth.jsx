import axios from "axios";
import React, { useEffect, useState } from "react";
export function useAuth () {
    const [auth, setAuth] = useState({
            loading: true,
            authenticated: false,
            user: null
        });

let token = localStorage.getItem('token');

        useEffect(() => {
            axios
                .post(`${import.meta.env.VITE_SERVER_API}/verify_jwt.php`,{}, { 
                    withCredentials: true })
                .then(res => {
                    setAuth({ loading: false, authenticated: res.data.authenticated, user: res.data.user || null });
                })
                .catch(() => {
                    setAuth({ loading: false, authenticated: false, user: null });
                });
        }, []);
        return auth;
}