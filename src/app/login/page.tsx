import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/card"
import LoginButton from "../../components/auth/LoginButton"
import AuthForm from "../../components/auth/AuthForm"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-200 p-4">
            <Card className="w-full max-w-[420px] shadow-lg border-none bg-surface">
                <CardHeader className="flex flex-col items-center space-y-6 pt-12 pb-8">
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <div className="text-center space-y-2">
                        <CardTitle className="text-display-large text-neutral-900">
                            로그인
                        </CardTitle>
                        <CardDescription className="text-body-large text-neutral-500">
                            쉐도잉 닌자에 오신 것을 환영합니다.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-12 px-8">
                    <div className="w-full space-y-4">
                        <AuthForm mode="login" />
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
                            구글로 로그인
                        </LoginButton>
                        <div className="text-center text-sm">
                            계정이 없으신가요?{" "}
                            <Link href="/signup" className="underline">
                                회원가입
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
