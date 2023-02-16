// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "forge-std/Vm.sol";
import "forge-std/Test.sol";

import "../src/Lock.sol";

contract ArbTest is Test {
    Lock lck;
    bytes[] data;
    
    constructor() {
        lck = new Lock();
    }

    function testGetOwner() public view {
        // vm.startPrank(address(0));
        // vm.startPrank(tx.origin);
        // vm.expectRevert(bytes("Received token amount is not enough to repay loan"));

        lck.lock();
        address owner = lck.getOwner();
        console.log("Owner: ", owner);
    }
}
