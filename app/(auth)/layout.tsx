const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
};
export default AuthLayout;
