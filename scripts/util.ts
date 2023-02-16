import { ethers } from "hardhat"
import nodemailer from 'nodemailer';

import ERC20 from '../abis/ERC20.json'
import { BNB_PROVIDER } from "./constant";

export namespace ERC20Util {
    // get ERC20 token symbol, address and decimals
    export async function getERC20Token(token_address: string,): Promise<[string, string, number]> {
        const token = new ethers.Contract(token_address, ERC20, BNB_PROVIDER);
        return [await token.symbol(), token.address, await token.decimals()];
    };

    // get token balance
    export async function getBalance(token_addr: any, owner: string, decimals: number): Promise<string> {
        return ethers.utils.formatUnits(await token_addr.balanceOf(token_addr, owner), decimals);
    }
}


export namespace EmailUtil {

    export async function sendEmail(subject: string, ...ctx: string[]) {
        let text: string = "";
        for (let c of ctx) {
            text += c;
        }
        const myTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'looperx95@gmail.com', // your gmail account which you'll use to send the emails
                pass: 'xxx', // the password for your gmail account
            }
        });


        const mailOptions = {
            from: 'looperx95@gmail.com',
            to: 'looperx95@gmail.com',
            subject: subject,
            text: text,

            html: `<h1 style="color: red;text-align:center">Hello there my sweetling!</h1>
           <p style="text-align:center">Let's send some <span style="color: red">freaking</span> emails!</p>`,
        }

        // sending the email
        myTransport.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(`Email is failed to send!`);
                console.error(err);
            } else {
                console.log(`Email is successfully sent!`);
            }
        })
    }

}

export namespace ERC20Util {
    // 获取集合全排列
    const permute = function (nums: number[]): number[][] {
        const res: number[][] = []
        const backtrack = (path: number[] = []) => {
            if (path.length === nums.length) res.push(path)
            for (const n of nums) {
                !path.includes(n) && backtrack(path.concat(n))
            }
        }
        backtrack();
        return res
    }
}
