import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdDashboard, MdGroups2 } from "react-icons/md";
import logoImage from '../../../img/backgrounds/FinalLogo.png';
import Image from "next/image";
import { FaCreditCard, FaLayerGroup, FaBook } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import DashboardView from "../DashboardView/DashboardView";
import { ServerDashboardData } from "@/types";
import axios from "axios";
import { useCookies } from "react-cookie";
import { CiLogout } from "react-icons/ci";
import { adminRanksColours } from "@/sharedConstants";
import { adminRanksList } from "@/sharedConstants";

const HomeSideBar = ({ data }: { data: ServerDashboardData }) => {
    const [cookies, setCookies] = useCookies();
    const [navState, setNavState] = useState<string>("");
    const [navMenu, setNavMenu] = useState<boolean>(false);
    const [playerCount, setPlayerCount] = useState<number>();
    const router = useRouter();
    const navItemStyle: string = "relative text-center mt-8 border-b-4 border-t-4 p-7 text-white font-medium cursor-pointer border-purple-400/50 text-xl";
    const params = useSearchParams();
    const setView = (viewName: string) => {
        router.push("/home?view=" + viewName);
    }

    useEffect(() => {
        if (!params?.get("view")) {
            setView("dash");
        }
    }, []);

    const logout = () => {
        setCookies("user-jwt-token", null);
        router.push("/");
    };

    const getIsActive = (view: string): string => {
        return params?.get("view") === view ? "border-b-2 pb-2 border-gray-400/50 text-gray-400" : "white"
    }

    useEffect(() => {
        axios.get("/api/playercount").then(count =>
            count.status === 200 ? setPlayerCount(count.data.players) : setPlayerCount(-1));
    }, []);

    const genericHamburgerLine: string = `h-1 w-6 my-1 rounded-full bg-white transition ease transform duration-300`

    return (
        <nav>
            <div className='sm:hidden dropdown inline-block relative'>
                <button
                    className='flex flex-col h-12 w-12 rounded justify-center items-center group'
                    onClick={() => setNavMenu(!navMenu)}
                >
                    <div
                        className={`${genericHamburgerLine} ${navMenu
                            ? 'rotate-45 translate-y-3 opacity-50 group-hover:opacity-100'
                            : 'opacity-50 group-hover:opacity-100'
                            }`}
                    />
                    <div
                        className={`${genericHamburgerLine} ${navMenu ? 'opacity-0' : 'opacity-50 group-hover:opacity-100'
                            }`}
                    />
                    <div
                        className={`${genericHamburgerLine} ${navMenu
                            ? '-rotate-45 -translate-y-3 opacity-50 group-hover:opacity-100'
                            : 'opacity-50 group-hover:opacity-100'
                            }`}
                    />
                </button>
            </div>

            {navMenu && <div className="block sm:hidden bg-black/30 border-t-4 border-gray-400/40 border-b-4 font-medium text-white p-4">
                <ul className="w-full text-center space-y-4">
                    <li onClick={() => setView("dash")} className={getIsActive("dash")}>Dashboard</li>
                    <li onClick={() => setView("credits")} className={getIsActive("credits")}>Credits</li>
                    <li onClick={() => setView("roster")} className={getIsActive("roster")}>Staff Roster</li>
                    <li onClick={() => setView("factions")} className={getIsActive("factions")}>Factions</li>
                    <li onClick={() => setView("punishments")} className={getIsActive("punishments")}>Punishments</li>
                    <li onClick={() => setView("staff")} className={getIsActive("staff")}>Staff</li>
                    <li onClick={logout}>Logout</li>
                </ul>
            </div>
            }

            <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-black/50" aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto backdrop-blur-lg border-r-4 border-gray-400/50">

                    <Image
                        src={logoImage}
                        alt="Cloud RP Logo Iamge"
                        className="scale-75"
                        height={300}
                        priority
                    />

                    <div className="text-center text-white">
                        <div className="text-white font-bold text-xl">
                            Cloud Roleplay
                        </div>

                        <p className="mt-4">{data.accountData.username}</p>

                        {data.accountData.adminLevel > 0 && <p className="relative mt-2 p-1 rounded-lg whitespace-nowrap text-ellipsis overflow-hidden" style={{ backgroundColor: adminRanksColours[data.accountData.adminLevel] }}>
                            {adminRanksList[data.accountData.adminLevel]}
                        </p>}
                    </div>


                    <ul className="space-y-2 font-medium mt-4 text-white">
                        <li onClick={() => setView("dash")} className={getIsActive("dash")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <MdDashboard className="text-3xl text-gray-400" />
                                <span className="ms-3">Dashboard</span>
                            </a>
                        </li>
                        <li onClick={() => setView("credits")} className={getIsActive("credits")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaCreditCard className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Credits</span>
                            </a>
                        </li>
                        <li onClick={() => setView("roster")} className={getIsActive("roster")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <MdGroups2 className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Staff Roster</span>
                            </a>
                        </li>
                        <li onClick={() => setView("factions")} className={getIsActive("factions")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaLayerGroup className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Factions</span>
                            </a>
                        </li>
                        <li onClick={() => setView("punishments")} className={getIsActive("punishments")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaBook className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Punishments</span>
                            </a>
                        </li>
                        {data.accountData.adminLevel > 0 && <li onClick={() => setView("staff")} className={getIsActive("staff")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <MdAdminPanelSettings className="text-3xl text-red-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap text-red-400">Staff</span>
                            </a>
                        </li>}
                        <li onClick={logout}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <CiLogout className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>
                            </a>
                        </li>
                    </ul>

                    <div className="p-4 mt-4 rounded-lg" role="alert">
                        <div className="flex items-center">
                            {
                                playerCount != -1 &&
                                <span className="bg-green-400 text-sm font-semibold me-2 px-2.5 py-0.5 rounded">Server is online with {playerCount} players</span>
                            }
                            {
                                playerCount == -1 &&
                                <span className="bg-red-400 text-sm font-semibold me-2 px-2.5 py-0.5 rounded">Server is offline</span>
                            }
                        </div>
                    </div>
                </div>
            </aside>

            <div className="p-4 sm:ml-64 h-screen">
                <DashboardView data={data} />
            </div>

        </nav>
    )

};

export default HomeSideBar;