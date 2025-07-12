interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="grow flex flex-col items-center justify-center">
      <section className="w-[32rem] space-y-4 pt-16">
        {children}
      </section>
    </div>
  );
}; 