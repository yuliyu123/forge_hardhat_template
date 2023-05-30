import { ethers } from "hardhat"
import chai from 'chai'

import LIQUDATION_ABI from "../typechain/Liquidator.sol/Liquidator.json";

const deployer = await ethers.getSigners();

async function deploy() {
    const liqFactory = await ethers.getContractFactory(LIQUDATION_ABI.abi, LIQUDATION_ABI.bytecode.object, deployer);
    const liquidator = await liqFactory.deploy();
    await liquidator.deployed();

    console.log("liquator address: ", liquidator.address);
}

await deploy();
