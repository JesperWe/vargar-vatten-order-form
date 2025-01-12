import {type NextRequest} from "next/server"
import sgMail, {ResponseError} from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "")

export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json()
        const text = JSON.stringify(requestData, null, 2)
        const html = `
        <div>
        <table>
        ${
            Object.keys(requestData).map(k => {
                return `<tr><td>${k}</td><td>${requestData[k]}</td></tr>`
            }).join('\n')
        } 
        </table>
        </div>`

        const {
            name,
            address,
            email,
            city,
            zip,
            copies
        }: {
            name: string
            address: string
            email: string
            city: string
            zip: string
            copies: number
        } = requestData

        const message = {
            to: 'jesper@journeyman.se',
            from: 'sendgrid@journeyman.se',
            subject: `Vargar&Vatten Beställning ${copies} ex från ${name}`,
            text, html
        }

        await sgMail.send(message)
    } catch (error) {
        if (error instanceof SyntaxError) {
            return new Response(error.message, {
                status: 400
            })
        }

        if (error instanceof ResponseError) {
            if (error.response) {
                console.error(error.response.body)
            }
            return new Response(error.message, {
                status: 500
            })
        }
        console.log("Unexpected Error:")
        console.log(error)
    }

    return new Response("Message sent", {
        status: 202
    })
}
