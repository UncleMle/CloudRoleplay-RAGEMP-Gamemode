import { adminRanksColours, factions, logTypes } from "@/sharedConstants";
import { ServerLog } from "@/types";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { FaSearch } from "react-icons/fa";
import useSWR from "swr";

const StaffToolPage = ({ adminLevel }: { adminLevel: number }) => {
    const [staffView, setStaffView] = useState<string>("");
    const [searched, setSearched] = useState<string>("");
    const [loading, setLoading] = useState<boolean>();
    const [searchObj, setSearchObj] = useState<any>();
    const [error, setError] = useState<string>("");
    const [cookies, setCookies] = useCookies();
    const seachParams = useSearchParams();
    const paramKey: string = "staffview";
    const router = useRouter();

    const views: string[] = [
        "quizview", "charsearch", "vehsearch", "accsearch"
    ]

    useEffect(() => {
        if (views.indexOf(staffView) === -1) setStaffView("none");
    }, [staffView]);

    useEffect(() => {
        if (typeof "window" !== undefined) {
            const urlSearchString = window.location.search;

            const params = new URLSearchParams(urlSearchString);
            if (params.get(paramKey)) {
                setStaffView(seachParams?.get(paramKey) as string);
            } else setStaffView("none");
        }

    }, [seachParams]);

    const setView = (viewName: string) => {
        router.push(`/home?view=staff&${paramKey}=` + viewName);
    }

    const searchCharacter = async (e: any) => {
        e.preventDefault();

        if (searched.length === 0) return;

        const options = {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "x-auth-token": cookies['user-jwt-token'],
                "x-search-character": searched
            },
        };

        let d = await axios.get("/api/staff/character-search", options);

        setSearchObj(d.data);
    };

    return (
        <div>
            {staffView === "none" && <div className="font-medium">
                {adminLevel > 0 && < button onClick={() => setView(views[0])} className="w-full border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    View active quizzes (<span style={{ color: adminRanksColours[1] }}>Support +</span>)
                </button>}

                {adminLevel >= 3 && <button onClick={() => setView(views[1])} className="w-full mt-6 border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    Character Search (<span style={{ color: adminRanksColours[3] }}>Moderator +</span>)
                </button>}

                {adminLevel >= 3 && <button onClick={() => setView(views[2])} className="w-full mt-6 border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    Vehicle Search (<span style={{ color: adminRanksColours[3] }}>Moderator +</span>)
                </button>}

                {adminLevel >= 7 && < button onClick={() => setView(views[3])} className="w-full mt-6 border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    Account Search (<span style={{ color: adminRanksColours[7] }}>Head Administrator +</span>)
                </button>}

            </div>
            }
            {
                staffView === views[0] && <div>quiz view</div>
            }
            {
                staffView === views[1] && <div>

                    <form onSubmit={searchCharacter} className="flex justify-center">
                        <div className="flex bg-black/30 rounded-xl"><input
                            value={searched}
                            onChange={(e: any) => setSearched(e.target.value)}
                            type="text"
                            maxLength={40}
                            className="ml-8 p-2 bg-transparent block rounded-lg outline-none"
                            placeholder="Enter a character name"
                        />

                            <button className="pl-2 pr-6">
                                <FaSearch />
                            </button>
                        </div>
                    </form>

                    {searchObj?.char ?
                        <div className="mt-10 mr-[25%] ml-[25%]">

                            <div className="w-full border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Character Name</span>
                                <span className="float-right">{searchObj.char.character_name}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Last Active</span>
                                <span className="float-right">{new Date(searchObj.char.UpdatedDate).toDateString()}</span>
                            </div>


                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Is Injured</span>
                                <span className="float-right">{
                                    searchObj.char.injured_timer > 0 ? <span className="text-green-400">True</span> : <span className="text-red-400">False</span>
                                }</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Money Amount</span>
                                <span className="float-right text-green-400">${searchObj.char.money_amount.toLocaleString("en-US")}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Cash Amount</span>
                                <span className="float-right text-green-400">${searchObj.char.cash_amount.toLocaleString("en-US")}</span>
                            </div>
                            
                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Health</span>
                                <span className="float-right text-green-400">{searchObj.char.character_health}%</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Player Factions</span>
                                <span className="float-right">{JSON.parse(searchObj.char.character_faction_data)?.map((f: number) => (
                                    <span>{factions[f].replace("_", " ")} </span>
                                ))}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Is Banned</span>
                                <span className="float-right">{searchObj.char.character_isbanned === 1 ? <span className="text-red-400">Banned</span> : <span className="text-green-400">Not Banned</span>}</span>
                            </div>

                            <div className="max-h-96 overflow-y-scroll mt-10">
                                {
                                    searchObj.logs.length > 0 &&
                                    <table className="w-full mt-10 ">
                                        <tr className="border-b-4 border-gray-400/50">
                                            <th className="pb-4">Type</th>
                                            <th className="pb-4">Description</th>
                                            <th className="pb-4">Date</th>
                                        </tr>
                                        {
                                            searchObj.logs.map((log: ServerLog, idx: number) => (
                                                idx > 0 && <tr key={idx} className="pb-4 border-b-2 border-gray-400/50">
                                                    <th className="pt-4 pb-4">{logTypes[log.log_type]}</th>
                                                    <th className="rounded-xl">{log.server_log_description}</th>
                                                    <th className="rounded-xl">{new Date(log.CreatedDate).toDateString()} ({new Date(log.CreatedDate).getHours()}:{new Date(log.CreatedDate).getMinutes()})</th>
                                                    <th></th>
                                                </tr>
                                            ))
                                        }
                                    </table>
                                }
                            </div>

                        </div>
                        : <p className="mt-4 font-medium text-lg">Character not found</p>}
                </div>
            }
            {
                staffView === views[2] && <div>veh Search</div>
            }
            {
                staffView === views[3] && <div>acc Search</div>
            }
        </div >
    )
};

export default StaffToolPage;