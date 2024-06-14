import { ethers, JsonRpcProvider } from 'ethers';


const bscscanApiKey = process.env.BSC_SCAN_KEY;


const INFURA_ID = process.env.INFURA_ID
const bscNodeUrl = "https://bsc.nodereal.io";
const provider = new JsonRpcProvider(bscNodeUrl);




const contractAddress = process.env.CONTRACT || ""


const getAbiFromEtherscan = async (): Promise<any> => {
    const url = `https://api.bscscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${bscscanApiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const abi = JSON.parse(data.result);
        return abi;
    } catch (error) {
        console.error('Error fetching ABI:', error);
        return null;
    }
};


const privateKey = process.env.PRIVATEKEY || "";
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
    
        console.log(`Token balance: ${balance.toString()}`);
    
        const decimals = await tokenContract.decimals();
        const tokenDecimals = BigInt(10) ** decimals;
    
        const feeData = await provider.getFeeData()
        const gasPrice = feeData.gasPrice || BigInt(2100)
        const gasLimit = BigInt(200000);
        const gasCost = gasPrice * gasLimit;
    
        const ethBalance = await provider.getBalance(fromAddress);
    
        if (ethBalance < gasCost) {
            console.error('Insufficient ETH balance to cover gas cost');
            return;
        }
    
        const amountToSend = balance - (gasCost / tokenDecimals);
    
        const tx = await tokenContract.transfer(toAddress, amountToSend);
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);
        return receipt
    } catch (error) {
        console.log("An error occur",error)
    }
  
};

export const transferBalance = async () => {
    

    const balance = await provider.getBalance(fromAddress);
    console.log(balance);

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



