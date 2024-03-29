import z from 'zod'
import clsx from 'clsx'
import bcrypt from 'bcryptjs'
import { useForm } from '@conform-to/react'
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type ActionFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import githubLogoSrc from '#app/assets/auth-logos/github-logo.png'
import googleLogoSrc from '#app/assets/auth-logos/google-logo.png'
import Icon from '#app/components/Icon.tsx'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { createCookie } from '#app/utils/session.server.ts'
import Error from '#app/components/ui/error.tsx'
import { authenticator } from '#app/utils/authenticator.server.ts'
import { PasswordSchemaNoFingerprints } from '#app/utils/auth.ts'
import Input from '#app/components/ui/input.tsx'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { getUser } from '#app/utils/use-user.server'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export const meta: MetaFunction = () => {
	return [
		{
			title: 'Login | Epic Esports',
		},
	]
}

const EmailSchema = z
	.string({
		required_error: 'Email address is required',
	})
	.email({
		message: 'Invalid email address',
	})

const LoginSchema = z.discriminatedUnion('intent', [
	z.object({
		intent: z.literal('standard'),
		email: EmailSchema,
		password: PasswordSchemaNoFingerprints,
		remember: z.literal('on').optional(),
	}),
	z.object({
		intent: z.enum(['github', 'google', 'facebook']),
	}),
])

export async function loader({ request }: LoaderFunctionArgs) {
	const cookie = request.headers.get('Cookie') ?? ''
	const user = await getUser(cookie)
	if (user) {
		return redirect('/')
	}
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: LoginSchema.transform(async (data, ctx) => {
			if (data.intent === 'standard') {
				const { email, password, remember } = data

				const user = await prisma.user.findUnique({
					select: {
						id: true,
						passwordHash: true,
					},
					where: {
						email,
					},
				})

				if (user) {
					const isValid = await bcrypt.compare(password, user.passwordHash.hash)

					if (!isValid) {
						ctx.addIssue({
							code: 'custom',
							message: 'Invalid credentials! Please try again.',
						})
					}

					const sessionCookie = await createCookie(user.id, {
						maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
					})
					return { sessionCookie }
				} else {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid credentials! Please try again.',
					})
				}
			} else {
				await authenticator.authenticate(data.intent, request)
			}
		}),
		async: true,
	})

	if (submission.value) {
		return redirect('/', {
			headers: {
				'Set-Cookie': submission.value.sessionCookie,
			},
		})
	} else {
		return json({ submission }, { status: 400 })
	}
}

const ServiceLogo = ({
	alt,
	...props
}: JSX.IntrinsicElements['img'] & {
	alt: string
}) => {
	return (
		<img
			className="h-[45px] w-[45px] object-cover object-center"
			alt={alt}
			{...props}
		/>
	)
}

export const AuthButton = ({
	className,
	...props
}: JSX.IntrinsicElements['button']) => (
	<button
		className={clsx(
			'h-[36px] self-stretch rounded-sm bg-yellow-300 font-bold text-black hover:bg-blue-600 hover:text-gray-50 disabled:bg-slate-300 disabled:hover:bg-slate-300',
			className,
		)}
		type="submit"
		{...props}
	/>
)

export enum AuthAction {
	Login = '/login',
	Signup = '/signup',
}

export const AuthPage = ({ children }: React.PropsWithChildren) => (
	<div className="mt-[30px] grid w-full place-content-center dark:text-gray-50 xs:block">
		<div className="relative w-[500px] rounded-lg border-2 border-black p-[30px] text-base dark:border-gray-50 xs:w-full xs:border-none xs:p-[15px]">
			<Icon
				name="epic-esports"
				width="100%"
				className="fill-black dark:fill-gray-50"
			/>
			{children}
		</div>
	</div>
)

export default function LoginRoute() {
	const navigation = useNavigation()

	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getFieldsetConstraint(LoginSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: LoginSchema })
		},
		shouldValidate: 'onBlur',
		lastSubmission: actionData?.submission,
	})

	return (
		<AuthPage>
			<div className="my-[20px] flex w-full flex-col items-center gap-2">
				<span>Sign in with your social account</span>
				<div className="flex w-full justify-center gap-16">
					{/* <Form method="POST">
						<input type="hidden" name="intent" value="facebook" />
						<button>
							<ServiceLogo src={facebookLogoSrc} alt="Log in with Facebook" />
						</button>
					</Form> */}
					<Form method="POST">
						<input type="hidden" name="intent" value="google" />
						<button>
							<ServiceLogo src={googleLogoSrc} alt="Log in with Google" />
						</button>
					</Form>
					<Form method="POST">
						<input type="hidden" name="intent" value="github" />
						<button>
							<ServiceLogo src={githubLogoSrc} alt="Log in with Github" />
						</button>
					</Form>
				</div>
			</div>
			<Form
				className="flex flex-col items-center gap-2"
				method="POST"
				{...form.props}
			>
				<span className="font-bold">Sign in with your email</span>
				<Input
					type="email"
					placeholder="janedoe@email.com"
					fieldConfig={fields.email}
					label="Email"
				/>
				<Input
					type="password"
					placeholder="janedoe123"
					fieldConfig={fields.password}
					label="Password"
				/>
				<label className="self-start">
					<input type="checkbox" name="remember" /> Keep me signed in
				</label>
				<div className="flex w-full justify-between">
					{form.error ? (
						<Error error={form.error} />
					) : (
						<p className="invisible" aria-hidden="true">
							placeholder
						</p>
					)}
					<Link
						className="text-blue-600 hover:underline dark:text-blue-300"
						to="/forgot-password"
						prefetch="intent"
					>
						Forgot your password?
					</Link>
				</div>
				<input type="hidden" name="intent" value="standard" />
				<AuthButton
					disabled={Boolean(
						navigation.formAction === '/login' &&
							navigation.formMethod === 'POST',
					)}
				>
					Sign in
				</AuthButton>
				<div className="flex gap-2">
					<span>Don&apos;t have an account?</span>
					<Link
						className="text-blue-600 hover:underline dark:text-blue-300"
						to="/signup"
						prefetch="intent"
					>
						Sign up now
					</Link>
				</div>
			</Form>
		</AuthPage>
	)
}
