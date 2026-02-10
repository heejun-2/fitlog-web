import { Link } from "react-router-dom";

export default function SignupPage() {
    return (
        <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 20 }}>회원가입</h1>

            <label style={{ display: "block", marginBottom: 6 }}>이메일</label>
            <input style={{ width: "100%", padding: 10, marginBottom: 12 }} />

            <label style={{ display: "block", marginBottom: 6 }}>닉네임</label>
            <input style={{ width: "100%", padding: 10, marginBottom: 12 }} />

            <label style={{ display: "block", marginBottom: 6 }}>비밀번호</label>
            <input
                style={{ width: "100%", padding: 10, marginBottom: 16 }}
                type="password"
            />

            <button style={{ width: "100%", padding: 12, cursor: "pointer" }}>
                회원가입
            </button>

            <p style={{ marginTop: 16 }}>
                이미 계정이 있나요? <Link to="/login">로그인</Link>
            </p>
        </div>
    );
}
