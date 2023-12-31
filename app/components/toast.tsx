import React from 'react'
import { useRouteLoaderData } from '@remix-run/react'
import { Toaster, toast as showToast } from 'sonner'
import { type loader as rootLoader } from '#app/root.tsx'

export default function EpicToaster() {
	const rootData = useRouteLoaderData<typeof rootLoader>('root')

	React.useEffect(() => {
		if (rootData?.toast) {
			showToast[rootData.toast.type](rootData.toast.title, {
				description: rootData.toast.description,
			})
		}
	}, [rootData?.toast])

	return (
		<Toaster
			position="top-center"
			closeButton
			theme={rootData?.theme === 'dark' ? 'dark' : 'light'}
			toastOptions={{
				classNames: {
					description: '[&&&]:text-gray-500',
				},
			}}
		/>
	)
}
