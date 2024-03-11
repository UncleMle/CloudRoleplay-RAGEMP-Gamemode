import { adminRanksColours } from "@/sharedConstants";
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
    const [searchObj, setSearchObj] = useState<object>();
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
                staffView === views[1] && <div className="flex justify-center">

                    <form onSubmit={searchCharacter}>
                        <div className="flex bg-black/30 rounded-xl"><input
                            value={searched}
                            onChange={(e: any) => setSearched(e.target.value)}
                            type="text"
                            maxLength={40}
                            className="ml-8 p-2 bg-transparent block rounded-lg outline-none"
                            placeholder="Enter a character name"
                        />

                            <button className="pl-2 pr-2">
                                <FaSearch />
                            </button>
                        </div>

                        {JSON.stringify(searchObj)}
                    </form>
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