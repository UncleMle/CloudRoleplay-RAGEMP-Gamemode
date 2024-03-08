"use client";

import React, { useEffect, useState } from 'react';
import { FaUser, FaLock } from "react-icons/fa";
import { useCookies } from "react-cookie";
import axios from 'axios';
import { EndpointRequestTypes } from '@/utilClasses';
import { useRouter } from 'next/navigation'

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cookies, setCookies] = useCookies();

    const router = useRouter();

    const handleUsernameChange = (e: any) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: any) => {
        setPassword(e.target.value);
    };

    useEffect(() => {
        if (cookies["user-jwt-token"]) router.push("/home");
    }, []);

    const handleLogin = async () => {
        try {
            const login = await axios.post('/api/auth', {
                method: EndpointRequestTypes.post,
                payload: {
                    username: username,
                    password: password
                }
            });

            if (login.status) router.push("/home");

        } catch {
            console.log("error");
        }
    }

    return (
        <div className="fixed inset-0 w-full text-white sm:text-lg text-md duration-300 font-medium">
            <div className="duration-300 container flex items-center max-w-3xl mx-auto">
                <div className="flex justify-center w-full">
                    <div className="sm:rounded-xl text-white w-full bg-black/60 backdrop-blur-xl border-b-4 border-t-4 shadow-2xl shadow-black border-purple-400/50 select-none duration-300 sm:p-8 p-4 mt-40">
                        <label className="block">
                            <span className="font-medium">Enter your username or email</span>
                            <div className="relative mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                <FaUser className="absolute top-3 left-2 scale-110 fa-solid text-gray-400" />
                                <input
                                    value={username}
                                    onChange={handleUsernameChange}
                                    type="text"
                                    maxLength={70}
                                    className="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none"
                                />
                            </div>
                        </label>

                        <label className="block mt-3">
                            <span className="font-medium">Enter your password</span>
                            <div className="relative mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                <FaLock className="absolute top-3 left-2 scale-110 fa-solid text-gray-400" />
                                <input
                                    value={password}
                                    onChange={handlePasswordChange}
                                    type="password"
                                    maxLength={70}
                                    className="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none"
                                />
                            </div>
                        </label>

                        <div>
                            <button className="font-medium text-sm mt-3 text-gray-300">Forgot your password?</button>
                        </div>

                        <div className="inline-flex w-full mt-4 space-x-10 font-medium">
                            <button onClick={handleLogin} className="w-full rounded-xl p-3 bg-gradient-to-l from-black/30 to-black/40 duration-300 hover:bg-black/20">
                                <span>
                                    Login <i className="fa-solid fa-right-to-bracket text-gray-400"></i>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;