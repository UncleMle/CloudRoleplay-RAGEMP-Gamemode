import { ServerDashboardData } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCashFill } from "react-icons/ri";
import CharacterList from "./CharacterList";
import CreditsPage from "./CreditsPage";
import PunishmentPage from "./PunishmentPage";


const DashboardView = ({ data }: { data: ServerDashboardData }) => {
    const [viewState, setViewState] = useState<string>("");
    const [selectIndex, setCharacterIndex] = useState<number>(0);
    const seachParams = useSearchParams();

    const views: string[] = [
        "dash", "credits", "factions", "punishments", "staff"
    ]

    useEffect(() => {
        if (views.indexOf(viewState) === -1) setViewState("dash");
    }, [viewState])

    useEffect(() => {
        if (typeof "window" !== undefined) {
            const urlSearchString = window.location.search;

            const params = new URLSearchParams(urlSearchString);

            if (params.get("view")) {
                setViewState(seachParams?.get("view") as string);
            } else setViewState("dash");
        }

    }, [seachParams]);

    return (
        <div className="text-white text-center bg-black/50 rounded-2xl p-8 ">

            {
                viewState === "dash" && <CharacterList characters={data.characters} />
            }

            {
                viewState === "credits" && <CreditsPage />
            }

            {
                viewState === "punishments" && <PunishmentPage />
            }

        </div>
    )
};

export default DashboardView;