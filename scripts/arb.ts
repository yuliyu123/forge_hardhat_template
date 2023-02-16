import { ethers } from "hardhat"
import chai from 'chai'

import arbContract from '../typechain/Arb.sol/Arb.json'

import { ERC20Util } from './util'
import { Dexes, TOKENS, PAIR_NODE_FORMAT, SWAP_DATA_FORMAT, FLASHLOAN_ADDRESS, BNB_PROVIDER, DEXES_MAP } from "./constant"

import { BellManFord } from './arb_bellman_ford'
import { Dex, Edge, PairNode } from "./model"


const { expect } = chai
const abiCoder = ethers.utils.defaultAbiCoder;

let arb: any;
let owner: any;


export async function deploy() {
    [owner] = await ethers.getSigners();
    const arbFactory = await ethers.getContractFactory(arbContract.abi, arbContract.bytecode.object, owner);
    arb = await arbFactory.deploy();
    expect(owner.address).to.eq(await arb.getOwner());
    return await arb.deployed();
}

// todo: get dex pending tokens
async function monitorBnbMempool(): Promise<string[]> {
    return TOKENS;
}

// get all pairs permations
export function getPairsPerms(_tokens: string[]): PairNode[][] {
    let res: PairNode[][] = [];

    const getPairNodes = (tokens: string[] = [], dex: Dex) => {
        let pair_nodes: PairNode[] = [];
        if (tokens.length == _tokens.length) {
            for (let i = 0; i < tokens.length - 1; ++i) {
                pair_nodes.push({
                    dex: {
                        name: DEXES_MAP.get(dex.factory.toLowerCase())!,
                        factory: dex.factory,
                        router: dex.router,
                    },
                    token_in: tokens[i],
                    token_out: tokens[i + 1],
                    amount_in: 100000,
                    ratio: 0
                }
                );
            }
            res.push(pair_nodes);
        }
        for (const token of _tokens) {
            !tokens.includes(token) && getPairNodes(tokens.concat(token), dex);
        }
    }

    for (let dex of Dexes) {
        getPairNodes([], dex);
    }

    return res;
}

export async function getPairsPrice(pairNodes: PairNode[]): Promise<Edge[]> {
    let encode_pairs: string[] = [];
    for (let pair of pairNodes) {
        const encode_pair = abiCoder.encode(PAIR_NODE_FORMAT, [pair.dex.factory, pair.dex.router, pair.token_in, pair.token_out, pair.amount_in, pair.ratio]);
        encode_pairs.push(encode_pair);
    }

    const pairs = await arb.getPrices(encode_pairs);
    let graph: Edge[] = []
    for (let pair of pairs) {
        const node = abiCoder.decode(PAIR_NODE_FORMAT, pair);
        console.log("dex factory: %s, node.router %s, token_in: %s, token_out: %s, ratio: %s", node.factory, node.router, node.token_in, node.token_out, Number(node.ratio));
        let e = new Edge(DEXES_MAP.get(node.factory.toLowerCase())!, node.factory, node.router, node.token_in, node.token_out, node.ratio);
        graph.push(e);
    }

    return graph;
}

async function startBellBanFord(tokens_perm: PairNode[]): Promise<[Edge[], number]> {
    const graph = await getPairsPrice(tokens_perm);
    let bellman_ford = new BellManFord();

    let [edges, profit] = bellman_ford.start(graph);
    console.log("paths: %s, profit: %s", edges, profit);
    return [edges, profit];
}

async function convertToSwapData(edges: Edge[]): Promise<String> {
    let swap_datas: SwapData[] = [];

    for (let edge of edges) {
        let swap_data: SwapData = {
            factory: edge.dex.factory,
            router: edge.dex.router,
            token_in: edge.u,
            token_out: edge.v,
            amount_in: 1,
        };
        swap_datas.push(swap_data);
    }
    return abiCoder.encode(SWAP_DATA_FORMAT, [swap_datas]);
}

// send tx by provider
async function sendTx(edges: Edge[], token_address: string): Promise<number> {
    // arb.startArb(data, BscLib.DODOFALSHLOAN, base_token, base_amount * base_decimals, base_decimals);
    const profit = await arb.startArb(await convertToSwapData(edges), FLASHLOAN_ADDRESS, token_address, ethers.utils.parseEther("1000"), ethers.utils.parseEther("1"));
    return profit;
}


export async function start() {
    let tokens = await monitorBnbMempool();
    const tokens_perms = getPairsPerms(tokens);

    console.log("e128 tokens_perms len: ", tokens_perms.length);
    for (let tokens_perm of tokens_perms) {
        console.log("tokens_perm: ", tokens_perm);
        let [edges, profit] = await startBellBanFord(tokens_perm);
        if (!edges.length) {
            console.log("e0 no profit edges found!");
            continue;
        }
        let [symbol, token_address, decimals] = await ERC20Util.getERC20Token(edges[0].u);
        if (profit <= 0) {
            console.log("e1 no profit");
            continue;
        }

        // simulate tx by fork url
        profit = await sendTx(edges, token_address);
        console.log("e2 simulate tx profit: %s", profit);
        if (profit <= 0) {
            console.log("e3 simulate tx no profit");
            continue;
        }

        profit = await sendTx(edges, token_address);
        if (profit <= 0) {
            console.log("e4 really tx no profit");
            continue;
        }

        console.log("e5 really send tx profit: %s, token symbol: %s, address: %s, balance", profit, symbol, token_address, ERC20Util.getBalance(token_address, owner.address, decimals));
        // EmailUtil.sendEmail()
    }
}
