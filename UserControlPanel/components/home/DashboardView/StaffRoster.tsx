import useEndpoint from "@/lib/Fetcher/useEndpoint";
import { adminRanksColours, adminRanksList } from "@/sharedConstants";
import axios from "axios";
import Image from "next/image";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import useSWR from "swr";

interface Admin {
    admin_name: string,
    admin_status: number,
    ucp_image_url: string
}

const StaffRoster = () => {
    const { data, isLoading } = useEndpoint("/api/data/roster");

    useEffect(() => {
        if (!data || isLoading || !data?.staff) return;

        data.staff.sort((a: Admin, b: Admin) => b.admin_status - a.admin_status);
    }, [data]);

    return (
        <div>

            <h2 className="text-2xl font-bold border-b-4 pb-4 border-gray-400/50">Staff Roster</h2>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-10">

                {
                    data?.staff && data.staff.map((staff: Admin, idx: number) => (
                        <div key={idx} className="border p-8 font-medium rounded-lg border-gray-400 backdrop-blur-lg">
                            <div className="flex justify-center items-center">
                                <Image className="rounded-full w-40 h-40 object-cover" src={staff.ucp_image_url ? staff.ucp_image_url : "https://i.imgur.com/J4m5RVt.png"} alt="Staff profile picture" width={150} height={150} />
                            </div>

                            <div className="mt-4">
                                <p className="pb-4">{staff.admin_name}</p>
                                <span className="p-1 rounded-lg" style={{ backgroundColor: adminRanksColours[staff.admin_status] }}>
                                    {adminRanksList[staff.admin_status]}
                                </span>
                            </div>
                        </div>
                    ))

                }

            </div>

        </div >
    )
}

export default StaffRoster;