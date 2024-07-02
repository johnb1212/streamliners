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

        const gasPrice = feeData.gasPrice! //|| BigInt(2100)
        
        const gasCost = gasPrice * gasLimit;
    
        const ethBalance = await provider.getBalance(fromAddress);

        console.log("Gas cost is", gasCost)
    
        if ((ethBalance < gasCost) || (ethBalance === BigInt(0))) {
            console.error('Insufficient ETH balance to cover gas cost for token transfer');
            return 
        }
        
        const abi = await getAbiFromEtherscan();
        if (!abi) {
            console.error('Failed to fetch ABI');
            return;
        }
        
        const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
        const balance = await tokenContract.balanceOf(fromAddress);
        const gasEst = await tokenContract.transfer.estimateGas(toAddress, balance)
        const gasEsC = gasEst * gasPrice
        console.log("Gas Price from estimate and gaslimit", gasEsC, gasCost)
      
      
        if(balance <= BigInt(0))
        {
            console.log("contract address", contractAddress, "no token available zero balance:",balance)
            return;
        }
        
        //const decimals = await tokenContract.decimals();
       // const tokenDecimals = BigInt(10) ** decimals;
    
        const amountToSend = balance //- (gasCost / tokenDecimals);
        //console.log("token balance",balance,"amount to send",amountToSend)
       
        
        
        
        if (ethBalance < gasEsC) {

            console.log("Insufficient ETH balance to cover gas,balance: ",ethBalance, "Gas estimate",gasEst);
            return 
        }
        
        const tx = await tokenContract.transfer(toAddress, amountToSend);
        const receipt = await tx.wait();
       
        return receipt
    }
    catch (error) {
        
        console.log("An error occur",error)
    }
  
};

/*
const checkBalance = async(address: string) => {

const feeData = await provider.getFeeData()

        const gasPrice = feeData.gasPrice! //|| BigInt(2100)
        
        const gasCost = gasPrice * gasLimit;
    
        const ethBalance = await provider.getBalance(address);
    
        if ((ethBalance < gasCost) || (ethBalance === BigInt(0))) {
            console.error('Insufficient ETH balance to cover gas cost for token transfer');
            return false;
        }

return gasCost

} */

 export const transferBalance = async () => {
    
    try
{
    const balance = await provider.getBalance(fromAddress);
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice! 
    const gasLimit = BigInt(21000); 
    const gasCost = gasPrice * gasLimit;

    if (balance < gasCost) {
        console.error('Insufficient balance to cover gas cost for native token');
        return;
    }

    const amountToSend = balance - gasCost;

    const tx = {
        to: toAddress,
        value: amountToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice
    };

    const gasEst = provider.estimateGas(tx)
    console.log("Gas estimate", gasEst)
    const transaction = await wallet.sendTransaction(tx);
    const receipt = await transaction.wait();
    return receipt

}
catch(error) {

    console.log("an error occur", error)

}
};



