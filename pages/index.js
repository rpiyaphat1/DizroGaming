import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    const [showLogin, setShowLogin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [usernameDisplay, setUsernameDisplay] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedLogin = localStorage.getItem('isLoggedIn');
        const savedAdmin = localStorage.getItem('isAdmin');
        const savedUser = localStorage.getItem('username');

        if (savedLogin === 'true') {
            setIsLoggedIn(true);
            setUsernameDisplay(savedUser || 'Member');
            if (savedAdmin === 'true') setIsAdmin(true);
        }
    }, []);

    // ✅ แก้ไข: บังคับให้ Facebook Plugin โหลดรูปขึ้นมาในหน้าแรก
    useEffect(() => {
        const loadFB = () => {
            if (window.FB) {
                try {
                    window.FB.XFBML.parse();
                } catch (e) {
                    console.error("FB Parse Error:", e);
                }
            } else {
                setTimeout(loadFB, 1000); // ถ้ายังไม่มาให้รอ 1 วิแล้วเช็คใหม่
            }
        };

        if (isClient) {
            loadFB();
        }
    }, [isClient]);

    const handleLogin = async () => {
        setErrorMsg('');
        if (!username || !password) {
            setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsLoading(true);
        try {
            // 🔥 ใช้ Relative Path เพื่อให้คุยกับ Vercel ได้ทันที
            const res = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    username: username.trim(),
                    password: password.trim()
                })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', data.username);
                if (data.role === 'admin') localStorage.setItem('isAdmin', 'true');
                setShowLogin(false);
                router.reload();
            } else {
                setErrorMsg(data.message || "Username หรือ Password ไม่ถูกต้อง");
            }
        } catch (error) {
            setErrorMsg("ไม่สามารถเชื่อมต่อระบบหลังบ้านได้ (ตรวจสอบการตั้งค่า Vercel API)");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.reload();
    };

    const games = [
        { id: 1, name: 'Heartopia', image: '/Heartopia_icon.webp', isReady: true },
        { id: 2, name: 'Mobile Legends', image: '/MLBB_icon.webp', isReady: false },
        { id: 3, name: 'Valorant', image: '/valorant.jpg', isReady: false },
        { id: 4, name: 'Roblox', image: '/Roblox.jpg', isReady: false },
    ];

    const handleGameClick = (game) => {
        if (!game.isReady) {
            alert('เกมนี้กำลังจะมาเร็วๆ นี้ครับ!');
            return;
        }
        if (!isLoggedIn) {
            setShowLogin(true);
        } else {
            router.push(`/topup/${game.id}`);
        }
    };

    return (
        <div style={containerStyle}>
            <nav style={navStyle}>
                <div style={navContainer}>
                    <img src="/DizroFont.png" alt="Logo" style={logoStyle} onClick={() => router.push('/')} />
                    <div style={menuItems}>
                        <span style={activeMenuLink} onClick={() => router.push('/')}>หน้าหลัก</span>
                        {isLoggedIn ? (
                            <div style={{ position: 'relative' }}>
                                <span style={menuLink} onMouseEnter={() => setShowDropdown(true)}>
                                    {usernameDisplay} ▾
                                </span>
                                {showDropdown && (
                                    <div style={dropdownStyle} onMouseLeave={() => setShowDropdown(false)}>
                                        {isAdmin && <div style={dropdownItem} onClick={() => router.push('/register')}>ลงทะเบียนสมาชิก</div>}
                                        <div style={{ ...dropdownItem, color: '#ff007f' }} onClick={handleLogout}>ออกจากระบบ</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span style={menuLink} onClick={() => setShowLogin(true)}>เข้าสู่ระบบ</span>
                        )}
                    </div>
                </div>
            </nav>

            <main style={mainStyle}>
                <h2 style={{ marginBottom: '40px', fontSize: '26px', fontWeight: 'bold' }}>เลือกเกมที่ต้องการเติม</h2>
                <div style={gridStyle}>
                    {games.map((game) => (
                        <div key={game.id}
                            style={{
                                ...cardStyle,
                                opacity: game.isReady ? 1 : 0.6,
                                filter: game.isReady ? 'none' : 'grayscale(80%)',
                                cursor: game.isReady ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => handleGameClick(game)}
                        >
                            <img src={game.image} alt={game.name} style={imageStyle} />
                            <div style={cardLabel}>
                                <b style={{ fontSize: '16px' }}>{game.name}</b>
                                <div style={{ color: game.isReady ? '#00ff88' : '#ff007f', fontSize: '0.85rem', marginTop: '5px' }}>
                                    {game.isReady ? 'เติมเลย' : 'Coming Soon'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showLogin && (
                <div style={modalOverlay}>
                    <div className="login-modal-neon">
                        <div className="modal-header">
                            <h2 className="modal-title">เข้าสู่ระบบ</h2>
                            <p className="modal-subtitle">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                        </div>
                        {errorMsg && <div className="error-banner">{errorMsg}</div>}
                        <div className="input-group">
                            <div className="input-wrapper">
                                <label className="input-label">ชื่อผู้ใช้งาน</label>
                                <input type="text" placeholder="Username" className="custom-input" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">รหัสผ่าน</label>
                                <input type="password" placeholder="Password" className="custom-input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>
                        <div className="button-group">
                            <button onClick={handleLogin} className="btn-login-main" disabled={isLoading}>
                                {isLoading ? 'กำลังประมวลผล...' : 'Login'}
                            </button>
                            <button onClick={() => setShowLogin(false)} className="btn-close-main" disabled={isLoading}>ปิด</button>
                        </div>
                    </div>
                </div>
            )}

            <footer style={footerStyle}>
                <div style={footerContainer}>
                    <div style={footerLeft}>
                        <h3 style={footerTitle}>DIZRO Gaming - บริการเติมเกมราคาถูก</h3>
                        <p style={footerInfoText}>สะดวก รวดเร็ว ปลอดภัย บริการดี จริงใจ<br />LineOA: @dizrogaming | เบอร์โทร: 099-4598462</p>
                    </div>
                    <div style={footerRight}>
                        <h3 style={socialTitle}>ติดตามเราบนโซเชียล</h3>
                        <div style={fbWrapper}>
                            {isClient && (
                                <div className="fb-page" data-href="https://www.facebook.com/DIZROGAMING" data-width="350" data-show-facepile="true">
                                    <blockquote cite="https://www.facebook.com/DIZROGAMING" className="fb-xfbml-parse-ignore">
                                        <a href="https://www.facebook.com/DIZROGAMING">DIZRO GAMING</a>
                                    </blockquote>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                .login-modal-neon { background: #ffffff; padding: 45px 40px; border-radius: 40px; width: 90%; max-width: 450px; text-align: left; position: relative; animation: glowPulse 3s infinite alternate; display: flex; flex-direction: column; gap: 20px; }
                @keyframes glowPulse { from { box-shadow: 0 10px 30px rgba(0, 204, 255, 0.2), 0 0 20px rgba(255, 0, 127, 0.2); } to { box-shadow: 0 20px 50px rgba(0, 204, 255, 0.4), 0 0 40px rgba(255, 0, 127, 0.4); } }
                .modal-header { margin-bottom: 5px; }
                .modal-title { color: #1a1a1a; font-size: 28px; font-weight: 800; margin: 0; }
                .modal-subtitle { color: #777; font-size: 14px; margin: 5px 0 0 0; }
                .error-banner { background: #fff0f0; color: #ff4d4d; padding: 12px 15px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; border-left: 4px solid #ff4d4d; }
                .input-group { display: flex; flex-direction: column; gap: 18px; }
                .input-wrapper { display: flex; flex-direction: column; gap: 8px; }
                .input-label { font-size: 13px; font-weight: 600; color: #444; margin-left: 5px; }
                .custom-input { width: 100%; padding: 15px 20px; border-radius: 15px; border: 2px solid #f0f3f7; background: #f8faff; font-size: 16px; color: #333; outline: none; transition: all 0.25s ease; box-sizing: border-box; }
                .custom-input:focus { background: #ffffff; border-color: #ff007f; box-shadow: 0 5px 15px rgba(255, 0, 127, 0.1); }
                .button-group { display: flex; gap: 12px; margin-top: 10px; }
                .btn-login-main { flex: 2; background: linear-gradient(135deg, #ff007f 0%, #ff4d4d 100%); color: white; border: none; padding: 16px; border-radius: 18px; font-weight: 700; font-size: 17px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(255, 0, 127, 0.2); }
                .btn-login-main:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(255, 0, 127, 0.3); }
                .btn-close-main { flex: 1; background: #f1f3f6; color: #666; border: none; padding: 16px; border-radius: 18px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; }
                .btn-close-main:hover { background: #e6e9ee; }
            `}</style>
        </div>
    );
}

// --- Styles ห้ามแก้ตรงนี้ครับ ---
const containerStyle = { backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Kanit', sans-serif" };
const navStyle = { background: 'linear-gradient(90deg, #41a0ff 0%, #ff21ec 100%)', position: 'sticky', top: 0, zIndex: 1000 };
const navContainer = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '100px' };
const logoStyle = { height: '180px', cursor: 'pointer', objectFit: 'contain' };
const menuItems = { display: 'flex', gap: '25px', alignItems: 'center' };
const menuLink = { color: 'white', cursor: 'pointer', fontWeight: '500' };
const activeMenuLink = { ...menuLink, borderBottom: '3px solid white' };
const mainStyle = { textAlign: 'center', padding: '60px 20px', flex: 1 };
const gridStyle = { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '35px' };
const cardStyle = { background: '#1e1e1e', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333', width: '200px', transition: '0.3s' };
const imageStyle = { width: '100%', height: '200px', objectFit: 'cover' };
const cardLabel = { padding: '15px', background: '#252525' };
const dropdownStyle = { position: 'absolute', top: '35px', right: '0', backgroundColor: '#fff', borderRadius: '12px', padding: '8px 0', minWidth: '180px', zIndex: 1001, color: '#333', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' };
const dropdownItem = { padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', textAlign: 'left' };
const footerStyle = { background: '#1a1a1a', padding: '60px 20px', borderTop: '2px solid #333', marginTop: 'auto' };
const footerContainer = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '50px' };
const footerLeft = { textAlign: 'left', flex: 1, minWidth: '300px' };
const footerTitle = { color: '#ffffff', marginBottom: '20px', fontSize: '1.4rem' };
const footerInfoText = { fontSize: '1.1rem', lineHeight: '2', color: '#bbbbbb' };
const footerRight = { flex: 0, minWidth: '350px', textAlign: 'left' };
const socialTitle = { color: '#ffffff', marginBottom: '15px', fontSize: '1.2rem' };
const fbWrapper = { borderRadius: '15px', overflow: 'hidden', width: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' };