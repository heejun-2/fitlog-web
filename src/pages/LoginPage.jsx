import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { loginApi, meApi } from "../api/auth";

export default function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("test@test.com");
    const [password, setPassword] = useState("1234");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const data = await loginApi(email, password);
            const token = data.accessToken ?? data;
            localStorage.setItem("accessToken", token);

            const me = await meApi();
            localStorage.setItem("me", JSON.stringify(me));
            nav("/dashboard");
        } catch {
            setErrorMsg("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="로그인"
            subtitle="오늘의 운동 기록과 주간 통계를 이어서 확인할 수 있습니다."
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
                    label="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    type="password"
                    autoComplete="current-password"
                />

                {errorMsg && (
                    <div className="ds-alert px-4 py-3 text-sm">
                        {errorMsg}
                    </div>
                )}

                <Button className="w-full justify-center" disabled={loading}>
                    {loading ? "로그인 중..." : "로그인"}
                </Button>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-600">계정이 없나요?</span>
                    <Link className="text-sm font-semibold text-slate-900 hover:text-orange-600" to="/signup">
                        회원가입
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
