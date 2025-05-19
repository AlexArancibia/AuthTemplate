const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className=" flex  h-auto items-center  ">{children}</div>;
};
export default AuthLayout;
