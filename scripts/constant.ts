import Web3 from "web3"
import * as dotenv from "dotenv";

dotenv.config();

export const ARB_PROVIDER = new Web3(process.env.ARB_RPC_RPC || "");
export const AAVEV3_ARB_POOL = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
