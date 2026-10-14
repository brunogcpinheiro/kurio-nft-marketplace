import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authApi } from '@/api/endpoints'
import { applyFieldErrors, errorMessage } from '@/api/errors'
import { registerInputSchema } from '@/api/schemas'
import { PasswordField, TextField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { safeRedirect } from './redirect'
import { useSessionActions } from './use-session'

const formSchema = registerInputSchema
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })

type FormValues = z.infer<typeof formSchema>

type Props = { redirect?: string; layout: 'dialog' | 'page' }

export function RegisterForm({ redirect, layout }: Props) {
  const navigate = useNavigate()
  const { signIn } = useSessionActions()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })
  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirm, ...input }: FormValues) => authApi.register(input),
    onSuccess: (auth) => {
      signIn(auth)
      void navigate({ to: safeRedirect(redirect), replace: true })
    },
    onError: (error) => {
      if (applyFieldErrors(error, form.setError, ['username', 'email', 'password'])) return
      form.setError('root', { message: errorMessage(error) })
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
        label="Nome de usuário"
        hideLabel
        autoComplete="username"
        placeholder="Nome de usuário"
        error={form.formState.errors.username?.message}
        inputClassName={inputClass}
        {...form.register('username')}
      />
      <TextField
        label="E-mail"
        hideLabel
        type="email"
        autoComplete="email"
        placeholder="Digite seu e-mail"
        error={form.formState.errors.email?.message}
        inputClassName={inputClass}
        {...form.register('email')}
      />
      <PasswordField
        label="Senha"
        hideLabel
        autoComplete="new-password"
        placeholder="Senha"
        error={form.formState.errors.password?.message}
        inputClassName={inputClass}
        {...form.register('password')}
      />
      <PasswordField
        label="Confirmar senha"
        hideLabel
        autoComplete="new-password"
        placeholder="Confirmar senha"
        error={form.formState.errors.confirmPassword?.message}
        inputClassName={inputClass}
        {...form.register('confirmPassword')}
      />
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
        {mutation.isPending ? 'Criando conta…' : layout === 'page' ? 'Criar perfil' : 'Criar conta'}
      </Button>
    </form>
  )
}
