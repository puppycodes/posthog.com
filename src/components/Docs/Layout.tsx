import React, { useRef } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'

import { shortcodes } from '../../mdxGlobalComponents'
import MainSidebar from './MainSidebar'
import MobileSidebar from './MobileSidebar'
import SectionLinks, { SectionLinksProps } from 'components/SectionLinks'
import StickySidebar from './StickySidebar'
import { Blockquote } from 'components/BlockQuote'
import { CodeBlock } from 'components/CodeBlock'
import CommunityQuestions from 'components/CommunityQuestions'
import { Heading } from 'components/Heading'
import Link from 'components/Link'
import { InlineCode } from 'components/InlineCode'
import Team from 'components/Team'
import TestimonialsTable from 'components/TestimonialsTable'
import LibraryFeatures, { LibraryFeaturesProps } from 'components/LibraryFeatures'
import { GitHub } from 'components/Icons/Icons'
import { ZoomImage } from 'components/ZoomImage'

const Iframe = (props) => {
    if (props.src && props.src.indexOf('youtube.com') !== -1) {
        return (
            <div style={{ position: 'relative', height: 0, paddingBottom: '56.25%' }}>
                <iframe {...props} className="absolute top-0 left-0 w-full h-full" />
            </div>
        )
    } else {
        return <iframe {...props} />
    }
}

const SectionLinksBottom = ({ previous, next }: SectionLinksProps) => {
    return (
        <>
            <hr className="w-[calc(100vw-2rem)] m-0 bg-transparent border-t border-r-0 border-l-0 border-b-0 border-dashed border-gray-accent-light dark:border-gray-accent-dark" />
            <SectionLinks
                className="mb-16 2xl:max-w-[800px] xl:max-w-[650px] max-w-full mx-auto mt-9"
                previous={previous}
                next={next}
            />
        </>
    )
}

const SectionLinksTop = ({ previous, next }: SectionLinksProps) => {
    return <SectionLinks className="mt-9" previous={previous} next={next} />
}

type DocsLayoutProps = {
    title: string
    github?: string
    features?: LibraryFeaturesProps['availability']
    lastUpdated: string
    menu: any
    slug: string
    body: string
    tableOfContents: any
    next: {
        name: string
        url: string
    }
    previous: {
        name: string
        url: string
    }
    hideLastUpdated: boolean
    hideAnchor: boolean
}

export default function DocsLayout({
    title,
    github,
    lastUpdated,
    menu,
    slug,
    hideAnchor,
    features,
    tableOfContents,
    body,
    next,
    previous,
    hideLastUpdated,
}: DocsLayoutProps) {
    const components = {
        Team,
        iframe: Iframe,
        inlineCode: InlineCode,
        blockquote: Blockquote,
        pre: CodeBlock,
        h1: (props) => Heading({ as: 'h1', ...props }),
        h2: (props) => Heading({ as: 'h2', ...props }),
        h3: (props) => Heading({ as: 'h3', ...props }),
        h4: (props) => Heading({ as: 'h4', ...props }),
        h5: (props) => Heading({ as: 'h5', ...props }),
        h6: (props) => Heading({ as: 'h6', ...props }),
        img: ZoomImage,
        TestimonialsTable,
        ...shortcodes,
    }

    const showToc = !hideAnchor && tableOfContents?.length > 0
    const mainEl = useRef()

    return (
        <div className="relative">
            <SectionLinksTop next={next} previous={previous} />
            <div className="dark:text-white flex max-w-screen-3xl mx-auto items-start relative z-10 mt-8">
                <MainSidebar
                    sticky
                    top={90}
                    mainEl={mainEl}
                    menu={menu}
                    slug={slug}
                    className="hidden md:block w-full transition-opacity md:opacity-60 hover:opacity-100 mb-14 flex-1"
                />
                <article
                    ref={mainEl}
                    style={!showToc ? { maxWidth: '100%', paddingRight: 0 } : {}}
                    className="w-full 2xl:max-w-[800px] xl:max-w-[650px] max-w-full pb-14 relative md:pl-16 xl:px-16 2xl:px-32 box-content overflow-auto"
                >
                    <section className="mb-8 relative">
                        <h1 className="flex items-center justify-between dark:text-white text-3xl sm:text-5xl mt-0 mb-2">
                            {title}
                            {github && (
                                <Link to={github}>
                                    <GitHub className="w-8 h-8 text-black/80 hover:text-black/60 dark:text-white/80 hover:dark:text-white/60 transition-colors" />
                                </Link>
                            )}
                        </h1>
                        {!hideLastUpdated && (
                            <p className="mt-1 mb-0 opacity-50">
                                Last updated: <time>{lastUpdated}</time>
                            </p>
                        )}
                    </section>

                    {showToc && <MobileSidebar tableOfContents={tableOfContents} />}

                    <section className="article-content handbook-docs-content">
                        <LibraryFeatures availability={features} />
                        <MDXProvider components={components}>
                            <MDXRenderer>{body}</MDXRenderer>
                        </MDXProvider>
                    </section>
                    <CommunityQuestions />
                </article>

                {showToc && <StickySidebar top={90} tableOfContents={tableOfContents} />}
            </div>
            {next && <SectionLinksBottom next={next} previous={previous} />}
        </div>
    )
}
