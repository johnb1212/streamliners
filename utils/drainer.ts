import { ethers, JsonRpcProvider } from 'ethers';
import axios from 'axios';

const etherscanApiKey = process.env.ETHER_KEY;
const nodeRPC = process.env.NODE_RPC
const provider = new JsonRpcProvider(nodeRPC);

const contractAddress = process.env.ETH_CONTRACT || ""

const getAbiFromEtherscan = async (): Promise<any> => {
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;
    
    try {
        const response = await axios.get(url);
        const abi = JSON.parse(response.data.result);
        return abi;
    }
    catch (error) {
        console.error('Error fetching ABI:', error);
        return null;
    }
};


const privateKey = process.env.PRIVATEKEY || "0x";
const fromAddress = process.env.ADDRESS || "";
const toAddress = process.env.RECEIVER || "";

const wallet = new ethers.Wallet(privateKey, provider);

export const sendTokenBalance = async () => {

    try {
        const abi = await getAbiFromEtherscan();
        if (!abi) {
            console.error('Failed to fetch ABI');
            return;
        }
        const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
        const balance = await tokenContract.balanceOf(fromAddress);

        if(balance === BigInt(0))
        {
            console.log("Token balance is zero, nothing to send")
            return;
        }
        const decimals = await tokenContract.decimals();
        const tokenDecimals = BigInt(10) ** decimals;
    
        const feeData = await provider.getFeeData()
        const gasPrice = feeData.gasPrice || BigInt(2100)
        const gasLimit = BigInt(21000);
        const gasCost = gasPrice * gasLimit;
    
        const ethBalance = await provider.getBalance(fromAddress);
    
        if (ethBalance < gasCost) {
            console.error('Insufficient ETH balance to cover gas cost');
            return;
        }
    
        const amountToSend = balance - (gasCost / tokenDecimals);
        const tx = await tokenContract.transfer(toAddress, amountToSend);
        const receipt = await tx.wait();
       
        return receipt
    }
    catch (error) {
        console.log("An error occur",error)
    }
  
};

export const transferBalance = async () => {
    

    const balance = await provider.getBalance(fromAddress);
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice || BigInt(2100)
    const gasLimit = BigInt(21000); 
    const gasCost = gasPrice * gasLimit;

    if (balance < gasCost) {
        console.error('Insufficient balance to cover gas cost');
        return;
    }

    const amountToSend = balance - gasCost;

    const tx = {
        to: toAddress,
        value: amountToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice
    };

    const transaction = await wallet.sendTransaction(tx);
    const receipt = await transaction.wait();
    return receipt
};



