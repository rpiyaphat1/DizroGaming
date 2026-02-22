import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [usernameDisplay, setUsernameDisplay] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClient, setIsClient] = useState(false);

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

    useEffect(() => {
        if (isClient && window.FB) {
            window.FB.XFBML.parse();
        }
    }, [isClient]);

    const handleLogout = () => {
        localStorage.clear();
        router.reload();
    };

    const handleRegister = async () => {
        setMessage('');
        if (!username || !password || !confirmPassword) {
            setMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("รหัสผ่านไม่ตรงกัน");
            return;
        }

        setIsLoading(true);
        try {
            // 🔥 เปลี่ยนเป็น Relative Path เพื่อใช้บน Vercel
            const res = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register',
                    username: username.trim(),
                    password: password.trim()
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("บันทึกสมาชิกใหม่สำเร็จแล้วครับ!");
                router.push('/');
            } else {
                setMessage(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
            }
        } catch (error) {
            setMessage("ไม่สามารถเชื่อมต่อระบบหลังบ้านได้ (ตรวจสอบ Vercel Deployment)");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <nav style={navStyle}>
                <div style={navContainer}>
                    <img src="/DizroFont.png" alt="Logo" style={logoStyle} onClick={() => router.push('/')} />
                    <div style={menuItems}>
                        <span style={menuLink} onClick={() => router.push('/')}>หน้าหลัก</span>
                        {isLoggedIn ? (
                            <div style={{ position: 'relative' }}>
                                <span style={activeMenuLink} onClick={() => setShowDropdown(!showDropdown)} onMouseEnter={() => setShowDropdown(true)}>
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
                            <span style={menuLink} onClick={() => router.push('/')}>เข้าสู่ระบบ</span>
                        )}
                    </div>
                </div>
            </nav>

            <main style={mainStyle}>
                <div style={regBox}>
                    <h2 style={{ marginBottom: '20px', color: '#333' }}>ลงทะเบียนสมาชิกใหม่</h2>
                    {message && <p style={{ color: '#ff007f', marginBottom: '15px', fontSize: '0.9rem' }}>{message}</p>}

                    <input type="text" placeholder="Username" style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                    <input type="password" placeholder="Password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                    <input type="password" placeholder="Confirm Password" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />

                    <button
                        onClick={handleRegister}
                        disabled={isLoading}
                        style={{
                            ...regBtn,
                            backgroundColor: isLoading ? '#ccc' : '#ff007f',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'กำลังติดต่อฐานข้อมูล...' : 'ยืนยันการสมัคร'}
                    </button>
                </div>
            </main>

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
        </div>
    );
}

// --- Styles ---
const containerStyle = { backgroundColor: '#0f0f0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Kanit, sans-serif' };
const navStyle = { background: 'linear-gradient(90deg, #41a0ff 0%, #ff21ec 100%)', position: 'sticky', top: 0, zIndex: 1000 };
const navContainer = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '100px' };
const logoStyle = { height: '180px', cursor: 'pointer', objectFit: 'contain' };
const menuItems = { display: 'flex', gap: '25px', alignItems: 'center' };
const menuLink = { color: 'white', cursor: 'pointer', fontWeight: '500' };
const activeMenuLink = { ...menuLink, borderBottom: '3px solid white' };
const dropdownStyle = { position: 'absolute', top: '35px', right: '0', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', padding: '8px 0', minWidth: '180px', zIndex: 1001, overflow: 'hidden' };
const dropdownItem = { padding: '12px 20px', color: '#333', cursor: 'pointer', fontSize: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' };
const mainStyle = { padding: '80px 20px', flex: 1, display: 'flex', justifyContent: 'center' };
const regBox = { background: 'white', padding: '40px', borderRadius: '25px', width: '350px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const regBtn = { color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' };
const footerStyle = { background: '#1a1a1a', padding: '60px 20px', borderTop: '2px solid #333', marginTop: 'auto' };
const footerContainer = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '50px' };
const footerLeft = { textAlign: 'left', flex: 1, minWidth: '300px' };
const footerTitle = { color: '#ffffff', marginBottom: '20px', fontSize: '1.4rem' };
const footerInfoText = { fontSize: '1.1rem', lineHeight: '2', color: '#bbbbbb' };
const footerRight = { flex: 0, minWidth: '350px', textAlign: 'left' };
const socialTitle = { color: '#ffffff', marginBottom: '15px', fontSize: '1.2rem' };
const fbWrapper = { borderRadius: '15px', overflow: 'hidden', width: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' };