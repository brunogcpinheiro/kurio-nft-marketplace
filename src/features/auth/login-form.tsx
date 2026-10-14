import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { authApi } from '@/api/endpoints'
import { applyFieldErrors, errorMessage, hasErrorCode } from '@/api/errors'
import { loginInputSchema, type LoginInput } from '@/api/schemas'
import { PasswordField, TextField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { OutOfScopeLink } from '@/components/out-of-scope-link'
import { safeRedirect } from './redirect'
import { useSessionActions } from './use-session'

type Props = { redirect?: string; layout: 'dialog' | 'page' }

export function LoginForm({ redirect, layout }: Props) {
  const navigate = useNavigate()
  const { signIn } = useSessionActions()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '' },
  })
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (auth) => {
      signIn(auth)
      void navigate({ to: safeRedirect(redirect), replace: true })
    },
    onError: (error) => {
      if (applyFieldErrors(error, form.setError, ['email', 'password'])) return
      form.setError('root', {
        message: hasErrorCode(error, 'UNAUTHENTICATED')
          ? 'E-mail ou senha inválidos.'
          : errorMessage(error),
      })
    },
  })
  const inputClass = layout === 'page' ? 'h-[50px] rounded-[10px]' : undefined

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      aria-busy={mutation.isPending}
    >
      <TextField
        label="E-mail"
        hideLabel
        type="email"
        autoComplete="email"
        placeholder="contato@email.com"
        error={form.formState.errors.email?.message}
        inputClassName={inputClass}
        {...form.register('email')}
      />
      <PasswordField
        label="Senha"
        hideLabel
        autoComplete="current-password"
        placeholder="Senha"
        error={form.formState.errors.password?.message}
        inputClassName={inputClass}
        {...form.register('password')}
      />
      <div className="flex justify-end">
        <OutOfScopeLink label="A recuperação de senha" className="text-brand text-sm">
          Esqueceu a senha?
        </OutOfScopeLink>
      </div>
      {form.formState.errors.root ? (
        <p role="alert" className="text-danger text-sm">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={mutation.isPending}
        className={
          layout === 'page'
            ? 'mt-7 h-[60px] rounded-[10px] text-base font-bold'
            : 'mt-3 h-[45px] rounded-[5px] text-base font-bold'
        }
      >
        {mutation.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
