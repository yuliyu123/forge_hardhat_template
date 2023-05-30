
async function main() {
    console.log("run success!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
