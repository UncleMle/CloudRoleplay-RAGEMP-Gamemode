import middleware from "@/lib/Middleware/Middleware";
import DatabaseController from "@/lib/mysqlDbController";
import { EndpointRequestTypes } from "@/utilClasses";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let staffMembers = await DatabaseController.selectQuery("SELECT admin_name, admin_status, ucp_image_url from accounts WHERE admin_status > 0");

    res.status(200).send({
        status: true,
        code: 200,
        staff: staffMembers
    });
};

export default middleware(handler, false, true, EndpointRequestTypes.get);