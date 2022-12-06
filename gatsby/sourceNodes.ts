import fetch from 'node-fetch'
import { MenuBuilder } from 'redoc'
import { GatsbyNode } from 'gatsby'

export const sourceNodes: GatsbyNode['sourceNodes'] = async ({ actions, createContentDigest, createNodeId }) => {
    const { createNode } = actions

    if (process.env.POSTHOG_APP_API_KEY) {
        const api_endpoints = await fetch('https://app.posthog.com/api/schema/', {
            headers: {
                Authorization: `Bearer ${process.env.POSTHOG_APP_API_KEY}`,
                accept: 'application/json',
            },
        }).then((res) => res.json())

        const menu = MenuBuilder.buildStructure({ spec: api_endpoints }, {})
        let all_endpoints = menu[menu.length - 1]['items'] // all grouped endpoints
        all_endpoints
        all_endpoints.forEach((endpoint) => {
            const node = {
                id: createNodeId(`api_endpoint-${endpoint.name}`),
                internal: {
                    type: `api_endpoint`,
                    contentDigest: createContentDigest({
                        items: endpoint.items,
                    }),
                },
                items: JSON.stringify(
                    endpoint.items.map((item) => ({ ...item, operationSpec: item.operationSpec, parent: null }))
                ),
                schema: endpoint.items.map((item) => ({ ...item, operationSpec: item.operationSpec, parent: null })),
                url: '/docs/api/' + endpoint.name.replace('_', '-'),
                name: endpoint.name,
            }
            createNode(node)
        })
        createNode({
            id: createNodeId(`api_endpoint-components`),
            internal: {
                type: `ApiComponents`,
                contentDigest: createContentDigest({
                    components: api_endpoints.components,
                }),
            },
            components: JSON.stringify(api_endpoints.components),
        })
    }

    const posthogIssues = await fetch(
        'https://api.github.com/repos/posthog/posthog/issues?sort=comments&per_page=5'
    ).then((res) => res.json())
    posthogIssues.forEach((issue) => {
        const { html_url, title, number, user, comments } = issue
        const data = {
            url: html_url,
            title,
            number,
            comments,
            user: {
                username: user?.login,
                avatar: user?.avatar_url,
                url: user?.html_url,
            },
        }
        const node = {
            id: createNodeId(`posthog-issue-${title}`),
            parent: null,
            children: [],
            internal: {
                type: `PostHogIssue`,
                contentDigest: createContentDigest(data),
            },
            ...data,
        }
        createNode(node)
    })

    const posthogPulls = await fetch(
        'https://api.github.com/repos/posthog/posthog/pulls?sort=popularity&per_page=5'
    ).then((res) => res.json())
    posthogPulls.forEach((issue) => {
        const { html_url, title, number, user } = issue
        const data = {
            url: html_url,
            title,
            number,
            user: {
                username: user?.login,
                avatar: user?.avatar_url,
                url: user?.html_url,
            },
        }
        const node = {
            id: createNodeId(`posthog-pull-${title}`),
            parent: null,
            children: [],
            internal: {
                type: `PostHogPull`,
                contentDigest: createContentDigest(data),
            },
            ...data,
        }
        createNode(node)
    })

    const integrations = await fetch(
        'https://raw.githubusercontent.com/PostHog/integrations-repository/main/integrations.json'
    ).then((res) => res.json())
    integrations.forEach((integration) => {
        const { name, url, ...other } = integration
        const node = {
            id: createNodeId(`integration-${name}`),
            parent: null,
            children: [],
            internal: {
                type: `Integration`,
                contentDigest: createContentDigest(integration),
            },
            url: url.replace('https://posthog.com', ''),
            name,
            ...other,
        }
        createNode(node)
    })

    const plugins = await fetch(
        'https://raw.githubusercontent.com/PostHog/integrations-repository/main/plugins.json'
    ).then((res) => res.json())
    plugins.forEach((plugin) => {
        const { displayOnWebsiteLib, name, ...other } = plugin
        if (displayOnWebsiteLib) {
            const node = {
                id: createNodeId(`plugin-${name}`),
                parent: null,
                children: [],
                internal: {
                    type: `Plugin`,
                    contentDigest: createContentDigest(plugin),
                },
                name,
                ...other,
            }
            createNode(node)
        }
    })
}
