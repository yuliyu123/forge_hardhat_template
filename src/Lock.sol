// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import "forge-std/console.sol";

contract Lock {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        console.log("Lock contract deployed");
        owner = msg.sender;
    }

    function lock() public view {
        console.log("Lock contract locked");
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawToken(address token) public onlyOwner {
        IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this)));
    }
}
