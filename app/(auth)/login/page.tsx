import FormLogin from "@/components/form-login"

interface LoginPageProps {
  searchParams: Promise<{ verified?: string; error?: string }>
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = await searchParams
  const isVerified = params.verified === "true"
  const OAuthAccountNotLinked = params.error === "OAuthAccountNotLinked"

  return <FormLogin isVerified={isVerified} OAuthAccountNotLinked={OAuthAccountNotLinked} />
}

export default LoginPage
