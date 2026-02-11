import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { signup } from "../api/auth";

export default function SignupPage() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState(""); // ✅ 추가

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            await signup({ email, password, nickname }); // ✅ 포함
            nav("/login");
        } catch {
            setErrorMsg("회원가입 실패: 이미 존재하는 이메일일 수 있어.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="회원가입" subtitle="30초면 끝. 이메일과 비밀번호만 입력해줘.">
            <form onSubmit={onSubmit} className="space-y-4">

                <Input
                    label="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                />

                {/* ✅ 닉네임 추가 */}
                <Input
                    label="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="활동명 / 닉네임"
                    autoComplete="nickname"
                />

                <Input
                    label="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상 권장"
                    type="password"
                    autoComplete="new-password"
                />

                {errorMsg && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {errorMsg}
                    </div>
                )}

                <Button className="w-full" disabled={loading}>
                    {loading ? "가입 중..." : "회원가입"}
                </Button>

                <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-slate-600">이미 계정이 있나요?</span>
                    <Link className="text-sm font-semibold text-slate-900 hover:underline" to="/login">
                        로그인
                    </Link>
                </div>

            </form>
        </AuthLayout>
    );
}
