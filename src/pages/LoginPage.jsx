import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {loginApi, meApi} from "../api/auth"; // 너가 만든 auth.js login 함수 사용

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
            // eslint-disable-next-line no-unused-vars
        } catch (e2) {
            setErrorMsg("로그인 실패: 이메일/비밀번호를 확인해줘.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="로그인"
            subtitle="운동 기록을 확인하려면 로그인해줘."
        >
            <form onSubmit={onSubmit} className="space-y-4">
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
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                />

                {errorMsg && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {errorMsg}
                    </div>
                )}

                <Button className="w-full" disabled={loading}>
                    {loading ? "로그인 중..." : "로그인"}
                </Button>

                <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-slate-600">계정이 없나요?</span>
                    <Link className="text-sm font-semibold text-slate-900 hover:underline" to="/signup">
                        회원가입
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
