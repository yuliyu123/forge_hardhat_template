import { ethers } from "hardhat"
import chai from 'chai'

import LockContract from '../typechain/Lock.sol/Lock.json'


const { expect } = chai
const abiCoder = ethers.utils.defaultAbiCoder;


describe('forge and hardhat test', () => {
    let lockContract: any;
    let deployer: any;

    beforeEach(async () => {
        [deployer] = await ethers.getSigners();

        const arbFactory = await ethers.getContractFactory(LockContract.abi, LockContract.bytecode.object, deployer);
        lockContract = await arbFactory.deploy();
        await lockContract.deployed();

        let owner = await lockContract.getOwner();
        expect(deployer.address).to.eq(owner);
    })

    it('lock test', async () => {

    });
})