function withValidProperties(properties: Record<string, undefined | string | string[]>) {
    return Object.fromEntries(
        Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
    );
}

export async function GET() {
    const URL = process.env.NEXT_PUBLIC_URL as string;
    return Response.json({
        "accountAssociation": {  // these will be added in step 5
            "header": "",
            "payload": "",
            "signature": ""
        },
        "baseBuilder": {
            "ownerAddress": "0xf9A0c8a231D0e0AdFffc281bD0C35AC1A992135C" // add your Base Account address here
        },
        "miniapp": {
            "version": "1",
            "name": "HODL",
            "homeUrl": "https://app.joinhodl.com/",
            "iconUrl": "https://app.joinhodl.com/logos/App_Icon.png",
            "splashImageUrl": "https://app.joinhodl.com/logos/App_Icon.png",
            "splashBackgroundColor": "#ffffff",
            "webhookUrl": "https://ex.co/api/webhook",
            "subtitle": "Hodl strong. Spend easy",
            "description": "Keep your assets. Minimize your portfolio.",
            "screenshotUrls": [
                "https://framerusercontent.com/images/QfooZw9LMnkCZk8oTgAi13Ysuy4.png",
                "https://app.joinhodl.com/logos/HODL_Primary_BlockBlue.svg",
                "https://app.joinhodl.com/logos/HODL_Primary_White.svg",
                "https://app.joinhodl.com/logos/HODL_Primary_ProtocolNavy.svg",
                "https://app.joinhodl.com/logos/hodl.png",
                "https://app.joinhodl.com/onboard/1.svg",
                "https://app.joinhodl.com/onboard/2.svg",
                "https://app.joinhodl.com/onboard/3.svg",
                "https://app.joinhodl.com/onboard/4.svg",
            ],
            "primaryCategory": "DeFi",
            "tags": ["HODL", "lending", "yield", "earn", "borrow", "spend", "miniapp", "baseapp"],
            "heroImageUrl": "https://app.joinhodl.com/logos/App_Icon.png",
            "tagline": "Hodl strong. Spend easy",
            "ogTitle": "Just HODL It.",
            "ogDescription": "Keep your assets. Minimize your portfolio.",
            "ogImageUrl": "https://app.joinhodl.com/logos/App_Icon.png",
            "noindex": true
        }
    }


    );
}