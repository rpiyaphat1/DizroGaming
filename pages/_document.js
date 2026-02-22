import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="th">
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500&display=swap" rel="stylesheet" />
            </Head>
            <body>
                {/* ใส่ SDK ไว้ที่นี่เพื่อให้โหลดพร้อมหน้าเว็บ */}
                <div id="fb-root"></div>
                <script async defer crossOrigin="anonymous"
                    src="https://connect.facebook.net/th_TH/sdk.js#xfbml=1&version=v22.0">
                </script>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}