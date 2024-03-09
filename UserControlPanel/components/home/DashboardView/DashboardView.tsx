import { ServerDashboardData } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCashFill } from "react-icons/ri";
import CharacterList from "./CharacterList";

const DashboardView = ({ data }: { data: ServerDashboardData }) => {
    const [viewState, setViewState] = useState<string>("");
    const [selectIndex, setCharacterIndex] = useState<number>(0);
    const urlSearchString = window.location.search;
    const seachParams = useSearchParams();


    useEffect(() => {
        console.log("view set " + seachParams?.get("view"));
        const params = new URLSearchParams(urlSearchString);

        if (params.get("view")) {
            setViewState(seachParams?.get("view") as string);
        } else setViewState("dash");

    }, [seachParams]);

    return (
        <div className="text-white text-center bg-black/50 rounded-2xl h-screen p-8">

            {
                viewState === "dash" && <CharacterList characters={data.characters} vehicles={[]} />
            }

        </div>
    )
};

export default DashboardView;