import Head from 'next/head';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>DIZRO Gaming - บริการเติมเกมราคาถูก</title>
                {/* ดึงฟอนต์ Kanit มาใช้ทั้งเว็บเพื่อให้เหมือนหน้าสมัครสมาชิก */}
                <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700&display=swap" rel="stylesheet" />
            </Head>
            <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Kanit', sans-serif !important;
          background-color: #0f0f0f;
          color: white;
        }
      `}</style>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;