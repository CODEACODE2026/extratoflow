import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ApiError } from "../../lib/api/client";
import "./auth.css";

type LoginPageProps = {
  sessionMessage?: string;
  onLogin: (email: string, password: string) => Promise<void>;
};

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const getLoginErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === "INVALID_CREDENTIALS") {
      return "Email ou senha invalidos.";
    }

    if (error.code === "LOGIN_FIELDS_REQUIRED") {
      return "Informe email e senha para entrar.";
    }

    return error.message;
  }

  return "Nao foi possivel entrar agora. Verifique a API e tente novamente.";
};

export function LoginPage({ onLogin, sessionMessage }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Informe o email.";
    }

    if (!password) {
      nextErrors.password = "Informe a senha.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onLogin(email.trim(), password);
    } catch (error) {
      setErrors({
        form: getLoginErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark">EF</span>
          <div>
            <strong>ExtratoFlow</strong>
            <span>Controle financeiro</span>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">Acesso interno</span>
          <h1 id="login-title">Entrar no sistema</h1>
        </div>

        {sessionMessage ? (
          <div className="login-alert" role="status">
            {sessionMessage}
          </div>
        ) : null}

        {errors.form ? (
          <div className="login-alert login-alert--error" role="alert">
            {errors.form}
          </div>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <Mail aria-hidden="true" size={17} />
            <Input
              autoComplete="email"
              error={errors.email}
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="financeiro@empresa.com"
              type="email"
              value={email}
            />
          </div>

          <div className="login-field login-field--password">
            <LockKeyhole aria-hidden="true" size={17} />
            <Input
              autoComplete="current-password"
              error={errors.password}
              label="Senha"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <Button
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="login-password-toggle"
              leadingIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => setShowPassword((current) => !current)}
              size="icon"
              variant="ghost"
            />
          </div>

          <Button className="login-submit" loading={loading} type="submit">
            Entrar
          </Button>
        </form>
      </section>
    </main>
  );
}
