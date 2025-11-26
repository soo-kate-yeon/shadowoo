import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
                    <Link href="/home" className="w-full">
                        <Button variant="social" size="social" className="bg-[#fee500] text-[#3c1e1e] hover:bg-[#fdd835]">
                            카카오로 시작하기
                        </Button>
                    </Link>
                    <Link href="/home" className="w-full">
                        <Button variant="social" size="social" className="bg-[#03c75a] text-white hover:bg-[#02b351]">
                            네이버로 시작하기
                        </Button>
                    </Link>
                    <Link href="/home" className="w-full">
                        <Button variant="social" size="social" className="bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50">
                            구글로 시작하기
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
