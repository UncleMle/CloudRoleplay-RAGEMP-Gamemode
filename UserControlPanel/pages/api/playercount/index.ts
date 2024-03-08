import apiErrorHandle from "@/lib/ErrorHandling/ErrorHandles";
import middleware from "@/lib/Middleware/Middleware";
import { ServerInfo, ServerList } from "@/types";
import { EndpointRequestTypes, HttpStatusCodes } from "@/utilClasses";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const ragempCdn: string = "https://cdn.rage.mp/master/";
const serverIp: string | undefined = process.env.RAGEMP_SERVERIP;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let servers: ServerList = (await axios.get(ragempCdn)).data;

    let server = servers[(serverIp as string).replaceAll(",", ".") + ":22005"];

    if (!server) return apiErrorHandle(res, HttpStatusCodes.NOT_FOUND);

    res.status(200).send({
        status: 200,
        players: server.players
    });
}

export default middleware(handler, false, false, EndpointRequestTypes.get);