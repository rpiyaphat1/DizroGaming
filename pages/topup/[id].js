import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TopupDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [uid, setUid] = useState('');
    const [aid, setAid] = useState('');
    const [roleName, setRoleName] = useState('');
    const [server, setServer] = useState('Asia');
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [usernameDisplay, setUsernameDisplay] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [popup, setPopup] = useState({ show: false, status: 'success', message: '' });

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
    }, [id]);

    useEffect(() => {
        if (isClient && window.FB) {
            window.FB.XFBML.parse();
        }
    }, [isClient]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageFile(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const openPaymentStep = () => {
        if (!uid || !aid || !roleName || !selectedPackage) {
            setPopup({
                show: true,
                status: 'error',
                message: 'กรุณากรอกชื่อในเกม, UID, AID และเลือกแพ็กเกจให้ครบถ้วนก่อนนะครับ'
            });
            return;
        }
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async () => {
        if (!imageFile) {
            alert('กรุณาแนบรูปภาพสลิปเพื่อยืนยันการโอนเงินครับ');
            return;
        }

        setIsSubmitting(true);
        try {
            // 🔥 เปลี่ยน Port จาก 5000 เป็น 5001 เพื่อให้ตรงกับ Backend ครับ
            const res = await fetch('http://127.0.0.1:5001/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: usernameDisplay,
                    gameName: currentGame.name,
                    roleName: roleName,
                    package: selectedPackage.name,
                    price: selectedPackage.price,
                    uid: uid,
                    aid: aid, // ✅ ใช้คีย์ aid ตามที่หลังบ้านรอรับ
                    server: currentGame.hasServer ? server : 'N/A',
                    imageFile: imageFile
                })
            });

            const result = await res.json();
            if (res.ok) {
                setShowPaymentModal(false);
                setPopup({
                    show: true,
                    status: 'success',
                    message: `🎉 ระบบได้รับข้อมูลเรียบร้อยแล้ว! \nรหัสอ้างอิง: ${result.transId || 'DZ-Checking'} \n\n⚠️ ข้อมูลจะถูกส่งเข้า Discord ของแอดมินทันทีครับ`
                });
            } else {
                setPopup({
                    show: true,
                    status: 'error',
                    message: result.message || '❌ เกิดข้อผิดพลาดในการส่งข้อมูล'
                });
            }
        } catch (error) {
            setPopup({
                show: true,
                status: 'error',
                message: '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (เช็คพอร์ต 5001 หรือยัง?)'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closePopup = () => {
        if (popup.status === 'success') {
            setImageFile(null);
            router.push('/'); // ส่งกลับหน้าแรกเมื่อเติมสำเร็จ
        }
        setPopup({ ...popup, show: false });
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const games = [
        { id: 1, name: 'Heartopia', image: '/Heartopia_icon.webp', hasServer: true },
        { id: 2, name: 'Mobile Legends', image: '/MLBB_icon.webp', hasServer: false },
    ];

    const heartopiaPackages = [
        { id: 1, name: '20 Heart Diamond', price: 16, img: '/pack_20.png' },
        { id: 2, name: '60 Heart Diamond', price: 35, img: '/pack_60.png' },
        { id: 3, name: '300+20 Heart Diamond', price: 165, img: '/pack_320.png' },
        { id: 4, name: '680+50 Heart Diamond', price: 330, img: '/pack_730.png' },
        { id: 5, name: '1280+90 Heart Diamond', price: 620, img: '/pack_1370.png' },
        { id: 6, name: '1980+150 Heart Diamond', price: 940, img: '/pack_2130.png' },
        { id: 7, name: '3280+270 Heart Diamond', price: 1599, img: '/pack_3550.png' },
        { id: 8, name: '6480+570 Heart Diamond', price: 2999, img: '/pack_7050.png' },
        { id: 9, name: 'Membership 7 days', price: 18, img: '/membership_7.png' },
        { id: 10, name: 'Membership 30 days', price: 95, img: '/membership_30.png' },
        { id: 11, name: 'Winter small pass', price: 17, img: '/winter_small.png' },
        { id: 12, name: 'Winter Luxury pass', price: 999, img: '/winter_luxury.png' },
        { id: 13, name: 'Box boost', price: 999, img: '/BoxBoost.png' },
    ];

    const currentGame = games.find(g => g.id === parseInt(id)) || games[0];

    return (
        <div style={containerStyle}>
            {/* Navbar */}
            <nav style={navStyle}>
                <div style={navContainer}>
                    <img src="/DizroFont.png" style={logoStyle} onClick={() => router.push('/')} alt="logo" />
                    <div style={menuItems}>
                        <span style={menuLink} onClick={() => router.push('/')}>หน้าหลัก</span>
                        {isLoggedIn && (
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
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-layout">
                <div className="left-section">
                    <img src={currentGame.image} style={bigGameImg} alt="game" />
                    <h2 style={{ marginTop: '15px' }}>{currentGame.name}</h2>
                    <div style={instructionBox}>
                        <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>วิธีหา UID และ AID</p>
                        <img src="/UID.png" style={stepImg} alt="uid guide" />
                        <img src="/AID.png" style={stepImg} alt="aid guide" />
                    </div>
                </div>

                <div className="right-section">
                    <div className="form-card">
                        <h3 style={sectionTitle}>1. ข้อมูลตัวละคร</h3>
                        <div className="character-grid">
                            <input type="text" placeholder="ชื่อในเกม" className="input-field" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                            <div className="input-split">
                                <input type="text" placeholder="UID" className="input-field" value={uid} onChange={(e) => setUid(e.target.value)} />
                                <input type="text" placeholder="AID" className="input-field" value={aid} onChange={(e) => setAid(e.target.value)} />
                            </div>
                            {currentGame.hasServer && (
                                <select className="input-field" value={server} onChange={(e) => setServer(e.target.value)}>
                                    <option value="Asia">Asia</option>
                                    <option value="America">America</option>
                                    <option value="Europe">Europe</option>
                                    <option value="TW/HK">TW/HK/MO</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="form-card">
                        <h3 style={sectionTitle}>2. เลือกสินค้า</h3>
                        <div className="package-grid">
                            {heartopiaPackages.map((pkg) => (
                                <div key={pkg.id} className={`pkg-card ${selectedPackage?.id === pkg.id ? 'active' : ''}`} onClick={() => setSelectedPackage(pkg)}>
                                    <img src={pkg.img} style={{ width: '45px', marginBottom: '5px' }} alt="package" />
                                    <div style={{ fontSize: '11px', color: '#ccc' }}>{pkg.name}</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>฿{pkg.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="submit-btn" onClick={openPaymentStep}>
                        ดำเนินการชำระเงิน
                    </button>
                </div>
            </main>

            {/* Modal ชำระเงิน */}
            {showPaymentModal && (
                <div className="modal-overlay">
                    <div className="modal-content payment-modal">
                        <h2 style={{ color: '#ff007f', marginBottom: '15px' }}>ชำระเงิน</h2>
                        <div style={{ background: '#000', padding: '15px', borderRadius: '15px', marginBottom: '20px', textAlign: 'left' }}>
                            <p style={{ fontSize: '14px', marginBottom: '5px' }}>รายการ: <span style={{ color: '#ff007f' }}>{selectedPackage.name}</span></p>
                            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>ยอดโอน: <span style={{ fontSize: '24px', color: '#00ff88' }}>฿{selectedPackage.price}</span></p>
                        </div>

                        <div style={{ background: '#fff', padding: '10px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px' }}>
                            <img src="/payment.jpg" style={{ width: '250px', display: 'block' }} alt="qr code" />
                        </div>

                        <div style={{ background: '#222', padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left' }}>
                            <p style={{ fontSize: '13px', color: '#fff' }}>กสิกรไทย: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>136-805-4883</span></p>
                            <p style={{ fontSize: '12px', color: '#888' }}>ชื่อบัญชี: ดิศพงษ์ ชินอ่อน</p>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                            <label style={{ fontSize: '14px', color: '#ff007f', fontWeight: 'bold' }}>แนบสลิปการโอนเงิน:</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: '10px', width: '100%' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowPaymentModal(false)} className="modal-btn-cancel" style={{ flex: 1 }}>ยกเลิก</button>
                            <button onClick={handleConfirmPayment} className="modal-btn" disabled={isSubmitting} style={{ flex: 2 }}>
                                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการโอนเงิน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {popup.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ fontSize: '50px' }}>{popup.status === 'success' ? '✅' : '⚠️'}</div>
                        <h2 style={{ color: popup.status === 'success' ? '#00ff88' : '#ff4141' }}>{popup.status === 'success' ? 'สำเร็จ!' : 'ขออภัย'}</h2>
                        <p style={{ whiteSpace: 'pre-line', margin: '20px 0' }}>{popup.message}</p>
                        <button onClick={closePopup} className="modal-btn">ตกลง</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .main-layout { display: flex; gap: 40px; max-width: 1100px; margin: 30px auto; padding: 0 20px; min-height: 70vh; }
                .left-section { flex: 1; text-align: center; }
                .right-section { flex: 1.5; width: 100%; }
                .form-card { background: #161616; padding: 25px; border-radius: 20px; margin-bottom: 20px; border: 1px solid #222; }
                .input-field { background: #000; border: 1px solid #333; color: #fff; padding: 14px; border-radius: 12px; font-size: 14px; width: 100%; margin-bottom: 12px; box-sizing: border-box; }
                .input-split { display: flex; gap: 12px; }
                .package-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; max-height: 400px; overflow-y: auto; }
                .pkg-card { background: #0a0a0a; padding: 15px; border-radius: 15px; cursor: pointer; border: 1px solid #222; text-align: center; }
                .pkg-card.active { border-color: #ff007f; background: rgba(255,0,127,0.1); }
                .submit-btn { width: 100%; padding: 18px; border-radius: 15px; background: linear-gradient(45deg, #ff007f, #41a0ff); color: #fff; border: none; font-weight: bold; cursor: pointer; }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(5px); }
                .modal-content { background: #1a1a1a; padding: 30px; border-radius: 30px; text-align: center; max-width: 420px; width: 90%; border: 1px solid #333; }
                .payment-modal { border: 2px solid #ff007f; }
                .modal-btn { background: #ff007f; color: #fff; border: none; padding: 12px 25px; border-radius: 12px; cursor: pointer; font-weight: bold; }
                .modal-btn-cancel { background: #333; color: #fff; border: none; padding: 12px 25px; border-radius: 12px; cursor: pointer; }
                @media (max-width: 768px) { .main-layout { flex-direction: column; align-items: center; } .input-split { flex-direction: column; } }
            `}</style>
        </div>
    );
}

// --- Global Styles ---
const containerStyle = { backgroundColor: '#0f0f0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'white' };
const navStyle = { background: 'linear-gradient(90deg, #41a0ff 0%, #ff21ec 100%)', position: 'sticky', top: 0, zIndex: 1000 };
const navContainer = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '100px' };
const logoStyle = { height: '180px', cursor: 'pointer', objectFit: 'contain' };
const menuItems = { display: 'flex', gap: '25px', alignItems: 'center' };
const menuLink = { color: 'white', cursor: 'pointer', fontWeight: '500' };
const dropdownStyle = { position: 'absolute', top: '35px', right: '0', backgroundColor: '#fff', borderRadius: '12px', padding: '8px 0', minWidth: '180px', zIndex: 1001 };
const dropdownItem = { padding: '12px 20px', color: '#333', cursor: 'pointer', borderBottom: '1px solid #eee', textAlign: 'left' };
const bigGameImg = { width: '120px', borderRadius: '25px' };
const sectionTitle = { color: '#ff007f', fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' };
const instructionBox = { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' };
const stepImg = { width: '100%', maxWidth: '280px', borderRadius: '12px', border: '1px solid #222' };