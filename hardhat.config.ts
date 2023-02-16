
import { HardhatUserConfig } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'

import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",

  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    hardhat: {
      // forking: {
      //   url: process.env.BSC_HTTPS_RPC || "",
      // },
      loggingEnabled: false
    },
    ropsten: {
      url: process.env.ROPSTEN_HTTPS_RPC || "",
      accounts:
        process.env.PRI_KEY !== undefined ? [process.env.PRI_KEY] : [],
    },
    aurora: {
      url: process.env.AURORA_HTTPS_RPC || "",
      accounts:
        process.env.PRI_KEY !== undefined ? [process.env.PRI_KEY] : [],
    },
    fantom: {
      url: process.env.FTM_HTTPS_RPC || "",
      accounts:
        process.env.PRI_KEY !== undefined ? [process.env.PRI_KEY] : [],
    },
    bsc: {
      url: process.env.BSC_HTTPS_RPC || "",
      accounts:
        process.env.PRI_KEY !== undefined ? [process.env.PRI_KEY] : [],
    },
    starnet: {
      url: process.env.STARNET_KEY || "",
      accounts:
        process.env.PRI_KEY !== undefined ? [process.env.PRI_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_HTTPS_RPC || "",
      accounts:
        process.env.PRI_KEY !== undefined ? [process.env.PRI_KEY] : [],
    },
  },

  mocha: {
    timeout: 40000
  }
};

export default config;
