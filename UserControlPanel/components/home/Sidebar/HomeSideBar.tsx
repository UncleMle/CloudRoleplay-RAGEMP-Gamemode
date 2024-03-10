import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";
import logoImage from '../../../img/backgrounds/FinalLogo.png';
import Image from "next/image";
import { FaCreditCard, FaLayerGroup, FaBook } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import DashboardView from "../DashboardView/DashboardView";
import { ServerDashboardData } from "@/types";
import axios from "axios";
import { useCookies } from "react-cookie";

const HomeSideBar = ({ data }: { data: ServerDashboardData }) => {
    const [cookies, setCookies] = useCookies();
    const [navState, setNavState] = useState<string>("");
    const [navMenu, setNavMenu] = useState<boolean>(false);
    const [playerCount, setPlayerCount] = useState<number>();
    const router = useRouter();
    const navItemStyle: string = "relative text-center mt-8 border-b-4 border-t-4 p-7 text-white font-medium cursor-pointer border-purple-400/50 text-xl";
    const adminRanksList: string[] = ["None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder", "Developer"];
    const adminRanksColours: string[] = ["", "#ff00fa", "#9666ff", "#37db63", "#018a35", "#ff6363", "#ff0000", "#00bbff", "#c096ff", "#c096ff"];

    const setView = (viewName: string) => {
        router.push("/home?view=" + viewName);
    }

    const logout = () => {
        setCookies("user-jwt-token", null);
        router.push("/");
    };

    useEffect(() => {
        axios.get("/api/playercount").then(count =>
            count.status === 200 ? setPlayerCount(count.data.players) : setPlayerCount(-1));
    }, []);

    return (
        <nav className="bg-black/50">
            <button onClick={() => setNavMenu(!navMenu)} data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>

            {navMenu && <div className="block sm:hidden bg-black/30 border-t-4 border-gray-400/40 border-b-4 font-medium text-white p-4">
                <ul className="w-full text-center space-y-4">
                    <li>Test</li>
                    <li>Test</li>
                    <li>Test</li>
                    <li>Test</li>
                    <li>Test</li>
                    <li>Test</li>
                </ul>
            </div>
            }

            <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-black/50" aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto backdrop-blur-lg border-r-4 border-gray-400/50">

                    <Image src={logoImage} alt="Cloud RP Logo Iamge" className="scale-75" height={300} />

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
                        <li onClick={() => setView("dash")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <MdDashboard className="text-3xl text-gray-400" />
                                <span className="ms-3">Dashboard</span>
                            </a>
                        </li>
                        <li onClick={() => setView("credits")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaCreditCard className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Credits</span>
                            </a>
                        </li>
                        <li onClick={() => setView("factions")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaLayerGroup className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Factions</span>
                            </a>
                        </li>
                        <li onClick={() => setView("punishments")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaBook className="text-3xl text-gray-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Punishments</span>
                            </a>
                        </li>
                        {data.accountData.adminLevel > 0 && <li onClick={() => setView("staff")}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <MdAdminPanelSettings className="text-3xl text-red-400" />
                                <span className="flex-1 ms-3 whitespace-nowrap text-red-400">Staff</span>
                            </a>
                        </li>}
                        <li onClick={logout}>
                            <a href="#" className="flex items-center p-2  rounded-lg">
                                <FaBook className="text-3xl text-gray-400" />
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