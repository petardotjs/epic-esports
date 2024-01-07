import clsx from 'clsx'
import React from 'react'

export const BlurrableImage = ({
	dataUrl,
	src,
	...props
}: JSX.IntrinsicElements['img'] & {
	src: string
	alt: string
	dataUrl: string
}) => {
	const [isLoaded, setIsLoaded] = React.useState(false)
	const imageRef = React.useRef<HTMLImageElement>(null)

	React.useEffect(() => {
		const listener = () => setIsLoaded(true)

		const image = imageRef.current

		// if already loaded from cache
		if (image?.complete) {
			setIsLoaded(true)
			// if not loaded from cache
		} else {
			image?.addEventListener('load', listener)
		}

		return () => image?.removeEventListener('load', listener)
	}, [])

	return (
		<>
			{/* it gets the alt from the props */}
			{/* eslint-disable-next-line jsx-a11y/alt-text */}
			<img
				{...props}
				src={src}
				className={clsx(
					{
						hidden: !isLoaded,
					},
					props.className,
				)}
				ref={imageRef}
			/>
			{/* it gets the alt from the props */}
			{/* eslint-disable-next-line jsx-a11y/alt-text */}
			<img
				{...props}
				src={`data:image/webp;base64,${dataUrl}`}
				className={clsx(
					{
						hidden: isLoaded,
					},
					props.className,
				)}
			/>
		</>
	)
}