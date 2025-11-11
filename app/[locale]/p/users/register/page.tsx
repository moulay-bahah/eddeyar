import RegisterForm from "./RegisterForm";
import RegisterFormNumber from "./RegisterFormNumber";

export default async function RegisterPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  console.log("local cote server");
  console.log("parmas test", params.locale);
  return <RegisterFormNumber lang={params.locale} urlboot={`/${params.locale}/api/telegram`} />;
}
