import React from 'react'
import clsx from 'clsx'
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import PostsBlock, { type Posts } from '#app/components/posts-block.tsx'
import { Link as CustomLink } from '#app/components/ui/link.tsx'
import {
	POSTS_LIMIT5_QUERY,
	POSTS_COUNT_QUERY,
	createPostsQueryByIds,
	createPostsQueryByQuery,
} from '#app/sanity/queries.ts'
import { loadQuery } from '#app/sanity/loader.server.ts'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { BlurrableImage } from '#app/components/blurrable-image.tsx'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { searchParams } = new URL(request.url)
	const searchQuery = searchParams.get('s')

	const referrer = request.headers.get('Referer')
	if (searchQuery === '') {
		throw redirect(referrer ?? '/')
	}

	const POSTS_BY_QUERY_QUERY = createPostsQueryByQuery(searchQuery ?? '')
	const postsByQuery = searchQuery
		? (await loadQuery<Posts>(POSTS_BY_QUERY_QUERY)).data
		: []

	const posts =
		searchQuery && postsByQuery.length > 0
			? []
			: (await loadQuery<Posts>(POSTS_LIMIT5_QUERY)).data
	const { data: postsCount } = await loadQuery<number>(POSTS_COUNT_QUERY)

	const mostReactedPosts = await prisma.post.findMany({
		select: {
			id: true,
		},
		orderBy: {
			reactions: {
				_count: 'desc',
			},
		},
		take: 5,
	})

	const mostReactedPostsIds = mostReactedPosts.map(post => post.id)
	const FEATURED_POSTS_QUERY = createPostsQueryByIds(mostReactedPostsIds)
	const featuredPosts = searchQuery
		? []
		: (await loadQuery<Posts>(FEATURED_POSTS_QUERY)).data

	return json({
		posts,
		postsCount,
		featuredPosts,
		searchQuery,
		postsByQuery,
	})
}

export default function Index() {
	const {
		posts: initialPosts,
		postsCount,
		featuredPosts,
		searchQuery,
		postsByQuery,
	} = useLoaderData<typeof loader>()

	const [posts, setPosts] = React.useState(initialPosts)
	const fetcherLoadMore = useFetcher<{
		posts: Posts
	}>()

	React.useEffect(() => {
		const fetcherData = fetcherLoadMore.data
		if (fetcherData) {
			setPosts(prev => [...prev, ...fetcherData.posts])
		}
	}, [fetcherLoadMore.data])

	const classNamesThemeToggleDelay = 'delay-500 duration-700'

	return (
		<div
			className={clsx(
				'mx-auto w-[1290px] pt-[30px] transition-all 2xl:w-[1120px] xl:w-[960px] md:w-full xs:pt-0',
				!searchQuery && 'flex items-start gap-[25px] lg:justify-center',
			)}
		>
			{searchQuery ? (
				<div className="flex flex-col gap-[20px]">
					<h1 className="text-2xl font-bold">
						<span className="text-gray-500">SEARCH RESULTS FOR </span>
						<span>&quot;{searchQuery.toUpperCase()}&quot;</span>
					</h1>
					{postsByQuery.length === 0 ? (
						<>
							<p className="text-center text-lg">No results were found.</p>
							<h2 className="text-2xl font-bold">LATEST</h2>
							<PostsBlock posts={posts} />
						</>
					) : (
						<PostsBlock posts={postsByQuery} />
					)}
				</div>
			) : posts.length ? (
				<>
					<div className="flex w-[760px] flex-shrink-0 flex-col 2xl:w-[637px] xl:w-[532px] md:w-[720px] sm:w-[540px] xs:w-full">
						<div className="mb-[30px]">
							<Link
								to={`/articles/${posts[0].category.slug}/${posts[0].slug}`}
								prefetch="intent"
							>
								<BlurrableImage
									className="aspect-[1.5] w-full object-cover object-center"
									src={posts[0].banner.url}
									alt={posts[0].banner.alt}
									dataUrl={posts[0].banner.dataUrl}
								/>
							</Link>
							<div className="bg-black p-5">
								<div className="mb-1 flex justify-between font-oswald">
									<CustomLink
										className="text-yellow-300 hover:underline hover:brightness-75"
										to={`/articles/${posts[0].category.slug}`}
									>
										{posts[0].category.title.toUpperCase()}
									</CustomLink>
									<span className="font-thin text-yellow-300">{`${formatDistanceToNow(
										new Date(posts[0].createdAt),
									).toUpperCase()} AGO`}</span>
								</div>
								<Link
									to={`/articles/${posts[0].category.slug}/${posts[0].slug}`}
									prefetch="intent"
								>
									<h2 className="text-xl font-bold text-gray-50">
										{posts[0].title}
									</h2>
								</Link>
							</div>
						</div>
						<div className="md:px-[10px]">
							{posts.slice(1, posts.length + 1).map((post, index) => {
								return (
									<div key={post.id}>
										<div
											className={clsx(
												'flex h-[150px] gap-[20px] md:flex-row-reverse xs:h-fit',
												index > 0 && 'mt-[20px]',
												index !== posts.length - 1 && 'mb-[20px]',
											)}
										>
											<Link
												className="h-full w-[250px] flex-shrink-0 md:h-full xs:aspect-[1.75] xs:w-[calc(50%-10px)]"
												to={`/articles/${post.category.slug}/${post.slug}`}
												prefetch="intent"
											>
												<BlurrableImage
													className="h-full w-full object-cover object-center"
													src={post.banner.url}
													alt={post.banner.alt}
													dataUrl={post.banner.dataUrl}
												/>
											</Link>
											<div className="flex w-full flex-col gap-[10px] xs:w-[0] xs:flex-grow">
												<span className="flex justify-between font-oswald sm:text-sm">
													<CustomLink to={`/articles/${post.category.slug}`}>
														{post.category.title.toUpperCase()}
													</CustomLink>
													<span className="font-thin dark:text-yellow-300">{`${formatDistanceToNow(
														new Date(post.createdAt),
													).toUpperCase()} AGO`}</span>
												</span>
												<Link
													to={`/articles/${post.category.slug}/${post.slug}`}
													prefetch="intent"
												>
													<h2 className="line-clamp-3 text-lg font-bold sm:text-sm">
														{post.title}
													</h2>
												</Link>
												<h3
													className={clsx(
														'line-clamp-1 sm:hidden',
														classNamesThemeToggleDelay,
													)}
												>
													{post.subtitle}
												</h3>
											</div>
										</div>
										{index >= postsCount - 2 ? null : (
											<hr className="border-gray-400" />
										)}
									</div>
								)
							})}
						</div>
						{postsCount <= posts.length ? null : (
							<button
								className={clsx(
									'my-5 self-center bg-yellow-400 px-2 py-3 font-bold dark:text-black',
									fetcherLoadMore.state !== 'idle' && 'opacity-50',
								)}
								onClick={() => {
									const url = `/posts?offset=${
										posts[posts.length - 1].createdAt
									}`

									fetcherLoadMore.load(url)
								}}
								disabled={fetcherLoadMore.state !== 'idle'}
							>
								{fetcherLoadMore.state === 'idle'
									? 'LOAD MORE'
									: 'LOADING MORE...'}
							</button>
						)}
					</div>
					<div className="flex grow flex-col gap-[15px] dark:text-gray-50 md:hidden">
						<h2
							className={clsx(
								'text-2xl font-bold leading-none',
								classNamesThemeToggleDelay,
							)}
						>
							<div className="w-fit">FEATURED STORIES</div>
						</h2>
						<hr className="h-[3px] border-0 bg-gray-400" />
						{featuredPosts.length > 0
							? featuredPosts.map((post, index) => (
									<div
										className="flex h-[120px] gap-5 2xl:h-[100px] xl:h-[84px]"
										key={post.banner.url}
									>
										<Link
											className="flex h-full w-[40%] flex-shrink-0"
											to={`/articles/${post.category.slug}/${post.slug}`}
											prefetch="intent"
										>
											<BlurrableImage
												className="h-full w-full object-cover object-center"
												src={post.banner.url}
												alt={post.banner.alt}
												dataUrl={post.banner.dataUrl}
											/>
										</Link>
										<div
											className={clsx(
												'flex flex-col justify-center',
												index !== featuredPosts.length - 1 &&
													`relative after:absolute after:top-[calc(100%+7px)] after:block after:h-[1px] after:w-[calc(100%-20px)] after:bg-gray-400 after:content-[""]`,
											)}
										>
											<CustomLink to={`/articles/${post.category.slug}`}>
												{post.category.title.toUpperCase()}
											</CustomLink>
											<Link
												to={`/articles/${post.category.slug}/${post.slug}`}
												prefetch="intent"
											>
												<h3 className="line-clamp-3 overflow-clip text-base font-semibold dark:text-gray-50 xl:line-clamp-2 xl:overflow-clip">
													{post.title}
												</h3>
											</Link>
										</div>
									</div>
								))
							: null}
					</div>
				</>
			) : (
				'No posts found.'
			)}
		</div>
	)
}
