
import { fetchBorrowers } from "./borrowers"
import LIQUDATION_ABI from "../typechain/Liquidator.sol/Liquidator.json";
import { ARB_PROVIDER } from "./constant";

import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const users: string[] = await fetchBorrowers(0, 'latest');

    console.log("users: ", users);
    const liqudator = new ARB_PROVIDER.eth.Contract(LIQUDATION_ABI.abi, process.env.AAVEV3_LIQUIDATOR);
    await liqudator.start(users).call();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
