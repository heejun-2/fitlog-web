import Card from "./ui/Card";

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="mx-auto flex min-h-screen items-center justify-center px-4 py-10">
                {/* max width를 줄이고(1100) 가운데 정렬 */}
                <div className="grid w-full max-w-[1100px] items-center gap-8 md:grid-cols-2">
                    {/* Left intro */}
                    <div className="hidden md:flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 text-slate-900">
                            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                                F
                            </div>
                            <span className="text-xl font-semibold">FitLog</span>
                        </div>

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
                            운동 기록을 <span className="text-slate-600">더 쉽게</span>
                        </h1>
                        <p className="mt-3 text-slate-600 leading-relaxed">
                            로그인 후 날짜별 기록을 빠르게 조회하고,
                            앞으로 통계/분석 화면까지 확장할 수 있어.
                        </p>

                        {/* 카드들이 너무 커 보이면 폭 제한 */}
                        <div className="mt-8 grid max-w-[520px] grid-cols-2 gap-4">
                            <div className="rounded-2xl border bg-white p-4">
                                <p className="text-xs text-slate-500">Today</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">기록 조회</p>
                                <p className="mt-1 text-sm text-slate-600">날짜별 운동/세트 확인</p>
                            </div>
                            <div className="rounded-2xl border bg-white p-4">
                                <p className="text-xs text-slate-500">Next</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">분석/통계</p>
                                <p className="mt-1 text-sm text-slate-600">성장 그래프(예정)</p>
                            </div>
                        </div>
                    </div>

                    {/* Right card */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-[520px]">
                            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-[0_10px_30px_rgba(2,6,23,0.08)] p-8">
                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-slate-500">FITLOG</p>
                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
                                    {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
                                </div>
                                {children}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
