import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { applyFieldErrors, errorMessage } from '@/api/errors'
import { profileInputSchema, type User } from '@/api/schemas'
import { PasswordField, TextField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { AvatarField } from './avatar-field'
import { useChangePassword, useUpdateAvatar, useUpdateProfile } from './queries'

const formSchema = profileInputSchema
  .extend({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    const touched = values.currentPassword || values.newPassword || values.confirmPassword
    if (!touched) return
    if (!values.currentPassword)
      ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Informe a senha atual' })
    if (values.newPassword.length < 8)
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'A nova senha precisa ter pelo menos 8 caracteres',
      })
    if (values.newPassword && values.newPassword === values.currentPassword)
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'A nova senha deve ser diferente da atual',
      })
    if (values.confirmPassword !== values.newPassword)
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'As senhas não coincidem',
      })
  })

type FormValues = z.infer<typeof formSchema>

const fieldLabel = 'text-[15px] leading-[15px]'
const inputClass = 'rounded-[3px]'

export function ProfileForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile()
  const updateAvatar = useUpdateAvatar()
  const changePassword = useChangePassword()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      ensName: user.ensName,
      walletNickname: user.walletNickname,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const errors = form.formState.errors
  const pending = updateProfile.isPending || changePassword.isPending

  async function submit(values: FormValues) {
    const { currentPassword, newPassword, confirmPassword: _confirm, ...profile } = values
    try {
      await updateProfile.mutateAsync(profile)
    } catch (error) {
      if (
        !applyFieldErrors(error, form.setError, [
          'displayName',
          'username',
          'email',
          'ensName',
          'walletNickname',
        ])
      ) {
        toast.error('Não foi possível salvar o perfil', { description: errorMessage(error) })
      }
      return
    }
    if (currentPassword || newPassword) {
      try {
        await changePassword.mutateAsync({ currentPassword, newPassword })
        form.resetField('currentPassword')
        form.resetField('newPassword')
        form.resetField('confirmPassword')
      } catch (error) {
        if (!applyFieldErrors(error, form.setError, ['currentPassword', 'newPassword'])) {
          toast.error('Não foi possível alterar a senha', { description: errorMessage(error) })
        }
        toast.warning('Dados do perfil salvos, mas a senha não foi alterada')
        return
      }
    }
    toast.success('Perfil atualizado')
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="flex flex-col gap-8"
      aria-busy={pending}
    >
      <h1 className="text-fg text-base leading-4 font-bold">Perfil do colecionador</h1>
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
        <TextField
          label="Nome de exibição"
          required
          error={errors.displayName?.message}
          inputClassName={inputClass}
          {...form.register('displayName')}
        />
        <TextField
          label="Nome de usuário"
          required
          autoComplete="username"
          error={errors.username?.message}
          inputClassName={inputClass}
          {...form.register('username')}
        />
        <TextField
          label="E-mail"
          required
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          inputClassName={inputClass}
          {...form.register('email')}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="ens-name" className={`text-fg ${fieldLabel}`}>
            Nome ENS{' '}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <div className="flex gap-2.5">
            <span
              className="border-surface-strong text-fg flex h-10 w-[78px] items-center justify-between rounded-[3px] border px-2.5 text-[15px]"
              aria-hidden="true"
            >
              .eth
            </span>
            <input
              id="ens-name"
              aria-invalid={errors.ensName ? true : undefined}
              aria-describedby={errors.ensName ? 'ens-error' : 'ens-hint'}
              aria-required
              className={`text-fg focus-visible:border-brand focus-visible:ring-brand/30 h-10 min-w-0 flex-1 rounded-[3px] border bg-transparent px-4 text-sm outline-none focus-visible:ring-2 ${errors.ensName ? 'border-danger' : 'border-surface-strong'}`}
              {...form.register('ensName')}
            />
          </div>
          {errors.ensName ? (
            <p id="ens-error" role="alert" className="text-danger text-xs">
              {errors.ensName.message}
            </p>
          ) : (
            <p id="ens-hint" className="text-fg-subtle text-xs">
              Só o nome, sem o sufixo .eth
            </p>
          )}
        </div>
        <TextField
          label="Apelido da carteira"
          required
          error={errors.walletNickname?.message}
          inputClassName={inputClass}
          {...form.register('walletNickname')}
        />
        <AvatarField
          value={user.avatarUrl}
          name={user.displayName}
          pending={updateAvatar.isPending}
          onChange={(dataUrl) =>
            updateAvatar.mutate(dataUrl, {
              onSuccess: () => toast.success(dataUrl ? 'Avatar atualizado' : 'Avatar removido'),
              onError: (error) =>
                toast.error('Não foi possível atualizar o avatar', {
                  description: errorMessage(error),
                }),
            })
          }
        />
      </div>

      <fieldset className="flex flex-col gap-6">
        <legend className="text-fg mb-6 text-base leading-4 font-medium">Alterar senha</legend>
        <div className="grid gap-6 md:max-w-[417px]">
          <PasswordField
            label="Senha atual"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            inputClassName={inputClass}
            {...form.register('currentPassword')}
          />
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            inputClassName={inputClass}
            {...form.register('newPassword')}
          />
          <PasswordField
            label="Confirmar nova senha"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            inputClassName={inputClass}
            {...form.register('confirmPassword')}
          />
        </div>
      </fieldset>

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-[131px] rounded-[3px] text-sm font-bold"
      >
        {pending ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  )
}
