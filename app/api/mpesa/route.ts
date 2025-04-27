import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Format the timestamp
    const date = new Date()
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2)

    // Prepare the STK push request payload
    const stkPushPayload = {
      BusinessShortCode: 174379,
      Password:
        "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjUwNDI3MTAyMzIy",
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: body.amount,
      PartyA: Number.parseInt(body.phoneNumber),
      PartyB: 174379,
      PhoneNumber: Number.parseInt(body.phoneNumber),
      CallBackURL: "https://shilingix.netlify.app/wallet",
      AccountReference: "ShilingiX",
      TransactionDesc: "Wallet Fund",
    }

    // Make the request to M-Pesa API
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    headers.append("Authorization", "Bearer TMv2xKjAEGF3su0VGzloFkpJIfNC")

    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers,
      body: JSON.stringify(stkPushPayload),
    })

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("M-Pesa API error:", error)
    return NextResponse.json({ error: "Failed to process M-Pesa payment" }, { status: 500 })
  }
}
