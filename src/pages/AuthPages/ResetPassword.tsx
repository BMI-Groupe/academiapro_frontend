import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <PageMeta title="Réinitialiser le mot de passe | AcademiaPro" description="Nouveau mot de passe" />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
