import { Link } from "react-router-dom";

export default function LoginPage() {
    return (
        <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 20 }}>로그인</h1>

            <label style={{ display: "block", marginBottom: 6 }}>이메일</label>
            <input
                style={{ width: "100%", padding: 10, marginBottom: 12 }}
                placeholder="test@test.com"
            />

            <label style={{ display: "block", marginBottom: 6 }}>비밀번호</label>
            <input
                style={{ width: "100%", padding: 10, marginBottom: 16 }}
                placeholder="1234"
                type="password"
            />

            <button style={{ width: "100%", padding: 12, cursor: "pointer" }}>
                로그인
            </button>

            <p style={{ marginTop: 16 }}>
                계정이 없나요? <Link to="/signup">회원가입</Link>
            </p>
        </div>
    );
}
