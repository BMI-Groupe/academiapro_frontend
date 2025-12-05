import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
        <PageMeta
            title="ACADEMIA PRO"
            description="Application de gestion d'école"
        />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
