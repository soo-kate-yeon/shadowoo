
import Link from "next/link"
import { Button } from "../../../ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/card"
import { Input } from "../../../ui/input"
import LoginButton from "@/components/auth/LoginButton"
import AuthForm from "@/components/auth/AuthForm"

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-200 p-4">
            <Card className="w-full max-w-[420px] shadow-lg border-none bg-surface">
                <CardHeader className="flex flex-col items-center space-y-6 pt-12 pb-8">
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-sm">
                        {/* Logo Icon Placeholder */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-white"
                        >
                            <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 17L12 22L22 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 12L12 17L22 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div className="text-center space-y-2">
                        <CardTitle className="text-display-large text-neutral-900">
                            계정 만들기
                        </CardTitle>
                        <CardDescription className="text-body-large text-neutral-500">
                            쉐도잉 서비스를 이용하려면 로그인이 필요해요.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-12 px-8">
                    <div className="w-full space-y-4">
                        <AuthForm mode="signup" />
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surface px-2 text-muted-foreground">
                                    또는
                                </span>
                            </div>
                        </div>
                        <LoginButton provider="google" variant="social" size="social" className="w-full bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50">
                            구글로 시작하기
                        </LoginButton>
                        <div className="text-center text-sm">
                            이미 계정이 있으신가요?{" "}
                            <Link href="/login" className="underline">
                                로그인
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
