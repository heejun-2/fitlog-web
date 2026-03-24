export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="ds-app-shell overflow-hidden">
            <div className="ds-hero-blur" />

            <div className="mx-auto flex min-h-screen max-w-[1200px] items-center justify-center px-4 py-10">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="hidden lg:flex flex-col justify-center">
                        <div className="ds-badge w-fit">
                            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-orange-500/20">
                                F
                            </span>
                            <span>FitLog 트레이닝 OS</span>
                        </div>

                        <h1 className="ds-title mt-8 max-w-[520px] text-5xl font-bold leading-[1.02]">
                            매일의 운동을,
                            <span className="block text-slate-500">더 선명하게 기록하세요.</span>
                        </h1>

                        <p className="mt-4 max-w-[520px] text-base leading-7 text-slate-600">
                            운동 기록, 세트 입력, 주간 통계를 하나의 흐름으로 연결하는
                            피트니스 전용 인터페이스입니다.
                        </p>

                        <div className="mt-10 grid max-w-[560px] grid-cols-2 gap-4">
                            <div className="ds-glass ds-panel p-5">
                                <p className="ds-kicker">오늘의 기록</p>
                                <p className="mt-3 text-lg font-semibold text-slate-950">운동 입력 흐름</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    날짜별 조회와 세트 입력을 자연스럽게 이어줍니다.
                                </p>
                            </div>

                            <div className="ds-glass ds-panel p-5">
                                <p className="ds-kicker">분석 인사이트</p>
                                <p className="mt-3 text-lg font-semibold text-slate-950">퍼포먼스 보기</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    볼륨, PR, 최근 운동을 같은 시각 언어로 정리합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-full max-w-[560px]">
                            <div className="ds-glass ds-panel p-8 sm:p-10">
                                <div className="mb-8">
                                    <p className="ds-kicker">FitLog</p>
                                    <h2 className="ds-title mt-3 text-3xl font-bold">{title}</h2>
                                    {subtitle && <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>}
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
