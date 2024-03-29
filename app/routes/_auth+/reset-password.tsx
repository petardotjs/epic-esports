import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
	json,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { useForm } from '@conform-to/react'
import { AuthButton, AuthPage } from '#app/routes/_auth+/login.tsx'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { ConfirmPasswordSchema, PasswordSchema } from '#app/utils/auth.ts'
import Error from '#app/components/ui/error.tsx'
import { invariantResponse } from '#app/utils/misc.server.ts'
import { getEmail } from '#app/utils/verify.server.ts'
import Input from '#app/components/ui/input.tsx'
import { createCookie } from '#app/utils/toast.server.ts'

const ResetPasswordSchema = z
	.object({
		password: PasswordSchema,
		confirmPassword: ConfirmPasswordSchema,
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Passwords do not match',
			})
		}
	})

const message =
	'Something went wrong. Please, try to request a verification email again.'

export async function loader({ request }: LoaderFunctionArgs) {
	const email = await getEmail(request)

	if (typeof email === 'string') {
		const user = await prisma.user.findUnique({
			select: {
				id: true,
			},
			where: {
				email,
			},
		})

		invariantResponse(user, message)
	} else {
		throw redirect('/login')
	}

	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	const email = await getEmail(request)
	const formData = await request.formData()

	const submission = parse(formData, {
		schema: ResetPasswordSchema,
	})

	if (typeof email === 'string') {
		if (submission.value) {
			const user = await prisma.user.findUnique({
				select: {
					id: true,
				},
				where: {
					email,
				},
			})

			if (user) {
				const hash = await bcrypt.hash(submission.value.password, 10)
				await prisma.user.update({
					data: {
						passwordHash: {
							create: {
								hash,
							},
						},
					},
					where: {
						id: user.id,
					},
				})

				const toastCookie = await createCookie({
					type: 'success',
					title: 'Password reset successfully',
				})

				return redirect('/login', {
					headers: {
						'Set-Cookie': toastCookie,
					},
				})
			}

			return json({ submission })
		} else {
			return json({ submission }, { status: 400 })
		}
	} else {
		throw redirect('/login')
	}
}

export default function ResetPasswordRoute() {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'reset-password-form',
		constraint: getFieldsetConstraint(ResetPasswordSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ResetPasswordSchema })
		},
	})

	return (
		<AuthPage>
			<Form {...form.props} className="flex flex-col gap-2" method="POST">
				<Input
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					fieldConfig={fields.password}
					label="Password"
				/>
				<Input
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					fieldConfig={fields.confirmPassword}
					label="Confirm Password"
				/>
				<Error id={form.errorId} error={form.error} />
				<AuthButton>Reset</AuthButton>
			</Form>
		</AuthPage>
	)
}
