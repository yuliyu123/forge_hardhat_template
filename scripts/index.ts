import { deploy, start } from "./arb"


async function main() {
    await deploy();
    await start();
}

main()
    .then((_) => {
        console.log("Finished!!!");
    })
    .catch((err) => {
        console.log(err);
    });
