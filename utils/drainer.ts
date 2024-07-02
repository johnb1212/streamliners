import { ethers, JsonRpcProvider } from 'ethers';
import axios from 'axios';

const etherscanApiKey = process.env.ETHER_KEY;
const nodeRPC = process.env.NODE_RPC
const provider = new JsonRpcProvider(nodeRPC);
const gasLimit = BigInt(21000);
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

        const feeData = await provider.getFeeData()

        const gasPrice = feeData.gasPrice!
    
        const ethBalance = await provider.getBalance(fromAddress);

        const abi = await getAbiFromEtherscan();
        if (!abi) {
            console.error('Failed to fetch ABI');
            return;
        }
        
        const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
        const balance = await tokenContract.balanceOf(fromAddress);
        const gasEst = await tokenContract.transfer.estimateGas(toAddress, balance)
        const gasCost = gasEst * gasPrice

        if (ethBalance < gasCost) 
        
    {
            console.error(`No ETH balance ${balance} to cover gas ${gasCost} for token transfer`);
            return 
        }

        if(balance <= BigInt(0))
        {
            console.log(`Zero token on ${fromAddress} for contract ${contractAddress}`)
            return;
        }
        const tx = await tokenContract.transfer(toAddress, balance);
        return true
    }
    catch (error) {
        
        console.log("An error occur",error)
    }
  
};


 export const transferBalance = async () => {
    
    try
{
    const balance = await provider.getBalance(fromAddress);
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice! 
   
    const gasEst = await provider.estimateGas({ to: toAddress, value: balance})
    const gasCost = gasPrice * gasEst;

  
   if (balance < gasCost || balance === BigInt(0)) {
        console.error(`Insufficient balance ${balance} to cover gas cost ${gasCost}`);
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
    //const receipt = await transaction.wait();
    //return receipt
    return true

}
catch(error) {

    console.log("an error occur", error)

}
};



