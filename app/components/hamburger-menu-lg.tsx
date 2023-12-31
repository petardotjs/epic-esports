import { DialogOverlay, DialogContent } from '@reach/dialog'
import { useRouteLoaderData, Link } from '@remix-run/react'
import React from 'react'
import Icon from '#app/components/Icon.tsx'
import CustomNavLink from '#app/components/ui/nav-link.tsx'
import { staticPageOptions } from '#app/constants/static-page-options.ts'
import { type loader } from '#app/root.tsx'

export default function HamburgerMenu({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const rootData = useRouteLoaderData<typeof loader>('root')
	const categories = rootData?.categories ?? []
	const linkReadyCategories = categories.map(category => {
		return {
			...category,
			slug: `/articles/${category.slug}`,
		}
	})
	const menuOptions = [...linkReadyCategories, ...staticPageOptions]

	return (
		<DialogOverlay
			className="fixed bottom-0 left-0 right-0 top-0 h-[100dvh] bg-black font-oswald text-2xl font-bold text-foreground-dark"
			onDismiss={() => setIsOpen(false)}
			isOpen={isOpen}
		>
			<DialogContent className="flex h-[100dvh] flex-col">
				<div className="flex h-[50px] w-full items-center justify-between px-[10px]">
					<Icon
						name="epic-esports"
						className="fill-current"
						width="45"
						height="45"
					/>
					<button
						onClick={() => setIsOpen(false)}
						className="flex h-[45px] items-center"
					>
						<Icon
							name="cross-1"
							width="20"
							height="20"
							className="fill-current"
						/>
					</button>
				</div>
				<div className="mx-[15px] mt-4 flex flex-grow flex-col gap-4 overflow-y-auto text-lg">
					{menuOptions.slice(0, 6).map(option => (
						<CustomNavLink
							key={option.title}
							option={option}
							onClick={() => setIsOpen(false)}
						/>
					))}
					<details open className="hamburger-details">
						<summary className="mb-4 flex items-center">
							<span className="mr-1">MORE</span>
							<Icon
								name="chevron-down"
								width="25"
								height="25"
								className="chevron fill-current transition-transform"
							/>
						</summary>
						<div className="ml-4 flex flex-col gap-4">
							{menuOptions.slice(6, menuOptions.length).map(option => (
								<CustomNavLink
									key={option.title}
									option={option}
									onClick={() => setIsOpen(false)}
								/>
							))}
						</div>
					</details>
					<style
						dangerouslySetInnerHTML={{
							__html: `
						.hamburger-details:not([open]) .chevron {
							transform: rotate(180deg);
						}
					`,
						}}
					/>
				</div>
				<div className="flex w-full justify-between p-[15px]">
					<Link
						to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon
							name="facebook-logo"
							width="35"
							height="35"
							className="fill-current"
						/>
					</Link>
					<Link
						to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon
							name="x-logo"
							width="35"
							height="35"
							className="fill-current"
						/>
					</Link>
					<Link
						to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon
							name="instagram-logo"
							width="35"
							height="35"
							className="fill-current"
						/>
					</Link>
					<Link
						to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon
							name="youtube-logo"
							width="35"
							height="35"
							className="fill-current"
						/>
					</Link>
					<Link
						to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon
							name="twitch-logo"
							width="35"
							height="35"
							className="fill-current"
						/>
					</Link>
				</div>
			</DialogContent>
		</DialogOverlay>
	)
}
