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

export const sendTokenBalance = async () => {

    try {
        
        const wallet = new ethers.Wallet(privateKey, provider);
        const feeData = await provider.getFeeData()

        const gP = feeData.gasPrice! 
        const gasPrice = gP * BigInt(15) / BigInt(10)
        //console.log("Increased and original gas",gasPrice, gP)
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
            
           // await transferBalance(gasPrice)
            return;
        }
        const tx = await tokenContract.transfer(toAddress, balance);
        
     //   await transferBalance(gasPrice)
        console.log("Transaction sent")
        return true
    
}
    catch (error) {
        
        console.log("An error occur in sending token",error)
    }
  
};


 export const transferBalance = async (gasPrice: bigint) => {
    
    try
{
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(fromAddress);
    
   
    const gasEst = await provider.estimateGas({ to: toAddress, value: balance})
    const gasCost = gasPrice * gasEst;

  const amountToSend = balance - gasCost;
   if (amountToSend <= BigInt(0)) {
        console.error(`Insufficient balance ${balance} to cover gas cost ${gasCost}`);
        return;
    }
    
    const tx = {
        to: toAddress,
        value: amountToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice
    };

    const transaction = await wallet.sendTransaction(tx);
    console.log("Mainnet eth sent")
    return true

}
catch(error) {

    console.log("Mainnet sending error", error)

}
};


