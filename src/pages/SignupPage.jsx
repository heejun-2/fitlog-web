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
    const [nickname, setNickname] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            await signup({ email, password, nickname });
            nav("/login");
        } catch {
            setErrorMsg("회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="회원가입"
            subtitle="이메일, 닉네임, 비밀번호만 입력하면 바로 FitLog를 시작할 수 있습니다."
        >
            <form onSubmit={onSubmit} className="space-y-5">
                <Input
                    label="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                />

                <Input
                    label="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="표시할 이름을 입력하세요"
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
                    <div className="ds-alert px-4 py-3 text-sm">
                        {errorMsg}
                    </div>
                )}

                <Button className="w-full justify-center" disabled={loading}>
                    {loading ? "가입 중..." : "회원가입"}
                </Button>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-600">이미 계정이 있나요?</span>
                    <Link className="text-sm font-semibold text-slate-900 hover:text-orange-600" to="/login">
                        로그인
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
