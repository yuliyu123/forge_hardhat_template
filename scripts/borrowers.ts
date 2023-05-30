import { AAVEV3_ARB_POOL, ARB_PROVIDER } from "./constant";
import AAVE3_ARB_POOL_ABI from "../abi/aavev3_arb_pool.json";

import * as dotenv from "dotenv";

dotenv.config();

// get borrowers based on-chain event
export async function fetchBorrowers(fromBlock: number, toBlock: number | string) {
    let users: string[] = [];
    const pool = new ARB_PROVIDER.eth.Contract(AAVE3_ARB_POOL_ABI, AAVEV3_ARB_POOL);

    pool.getPastEvents("Borrow", {
        fromBlock: fromBlock,
        toBlock: toBlock
    }, async (err, events) => {
            if (err) {
                console.log("err: ", err);
            }

            if (!events || !events.length) {
                console.log("no events");
                return;
            }

            for (let event of events) {
                users.push(event.returnValues.user);
            }
        });

    return users;
}
