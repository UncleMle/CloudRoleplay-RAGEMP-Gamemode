"use client";

import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useSWR from "swr";
import HomeSideBar from "./Sidebar/HomeSideBar";
import LoadingSpinner from "../utilComponents/LoadingSpinner";

const HomePage = () => {
    const { isLoading, data, error } = useHome();
    const router = useRouter();

    useEffect(() => {
        if (error) router.push("/");
    }, []);

    return (
        <div className={"relative " + (!data ? "bg-black/80 h-screen" : "")}>
            {!data && <div className="absolute top-60 left-1/2">
                <LoadingSpinner />
            </div>}

            {data && <HomeSideBar data={data} />}
        </div>
    )
}

function useHome() {
    const [cookies, setCookie] = useCookies();
    const token = cookies["user-jwt-token"];

    const options = {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-auth-token": token,
            "x-unix-sent": Math.round(Date.now() / 1000),
        },
    };

    const fetcher = (url: string) =>
        axios.get(url, options).then((res) => res.data);

    const { data, error, mutate, isLoading } = useSWR("/api/data/home", fetcher);

    const loggedOut = error && error.status === 403;

    if (!token) return { error: true };

    return {
        isLoading,
        loggedOut,
        data,
        mutate,
    };
}


export default HomePage;