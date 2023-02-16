import pancake_mainnet from '../addresses/pancake-mainnet.json'
import biswap_mainnet from '../addresses/biswap-mainnet.json'
import tokens from '../addresses/tokens.json'
import { ethers } from "hardhat"
import { Dex } from "./model"

export let DEXES_MAP = new Map<string, string>();
DEXES_MAP.set(pancake_mainnet.factory.toLowerCase(), "pancake");
DEXES_MAP.set(biswap_mainnet.factory.toLowerCase(), "biswap");


// Dexs
export const Dexes: Dex[] = [
    // panacake
    {
        name: DEXES_MAP.get(pancake_mainnet.factory.toLowerCase())!,
        factory: pancake_mainnet.factory,
        router: pancake_mainnet.router,
    },
    // biswap
    {
        name: DEXES_MAP.get(biswap_mainnet.factory.toLowerCase())!,
        factory: biswap_mainnet.factory,
        router: biswap_mainnet.router,
    }
];

// tokens
export let TOKENS: string[] = [tokens.wbnb, tokens.busd, tokens.usdt];

// rpc node and provider
export const FORK_HTTPS_URL = "https://maximum-weathered-surf.bsc.discover.quiknode.pro/9dc1e01ab166568822228266f8896910b55a6170/";
export const HTTPS_URL = "https://maximum-weathered-surf.bsc.discover.quiknode.pro/9dc1e01ab166568822228266f8896910b55a6170/";

export const BNB_PROVIDER = new ethers.providers.JsonRpcProvider(HTTPS_URL);


// format
export const PAIR_NODE_FORMAT = ["address factory", "address router", "address token_in", "address token_out", "uint256", "uint256 ratio"]
export const SWAP_DATA_FORMAT = ["Dex dex, address, uint256, address"];

// flashloan address
export const FLASHLOAN_ADDRESS = "0x0fe261aeE0d1C4DFdDee4102E82Dd425999065F4";
