import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="th">
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500&display=swap" rel="stylesheet" />
            </Head>
            <body>
                {/* 🛡️ Facebook SDK - วางไว้ต้น body เพื่อความชัวร์ */}
                <div id="fb-root"></div>
                <script async defer crossOrigin="anonymous"
                    src="https://connect.facebook.net/th_TH/sdk.js#xfbml=1&version=v18.0">
                </script>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}