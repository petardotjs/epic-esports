import * as React from 'react'
import { Link } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'

type Posts = Array<{
	id: string
	title: string
	subtitle: string
	createdAt: string
	authors: Array<{
		id: string
		name: string
	}>
	images: Array<{
		id: string
		altText: string | null
	}>
	category: {
		name: string
		urlName: string
		quote: string
	}
}>

export default function PostsBlock({ posts }: { posts: Posts }) {
	return (
		<div className="p-10 pt-5 border border-gray-300 dark:text-white">
			{posts.map((post, index) => {
				return (
					<React.Fragment key={post.id}>
						<Link
							className="flex gap-5 my-5"
							to={`/${post.category.urlName}/${post.id}`}
							key={post.id}
						>
							<img
								className="h-[220px] w-[410px] object-cover object-center"
								src={`/resources/image/${post.images[0].id}`}
								alt={post.images[0].altText ?? ''}
								loading="lazy"
							/>
							<div className="flex flex-col justify-between">
								<span className="font-bold">{post.category.name}</span>
								<h3 className="font-bold">{post.title}</h3>
								<h4>{post.subtitle}</h4>
								<span className="flex gap-3">
									<span>
										BY{' '}
										{post.authors.map(author => (
											<Link key={author.id} to={`authors/${author.id}`}>
												{author.name}
											</Link>
										))}
									</span>
									<span>
										{`${formatDistanceToNow(
											new Date(post.createdAt),
										).toUpperCase()} AGO`}
									</span>
								</span>
							</div>
						</Link>
						{index === posts.length - 1 || <hr />}
					</React.Fragment>
				)
			})}
		</div>
	)
}
