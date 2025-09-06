// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';
import starlightThemeGalaxy from 'starlight-theme-galaxy'
// https://astro.build/config
export default defineConfig({
    markdown: {
        remarkPlugins: [],
        rehypePlugins: [rehypeMermaid],
    },

    site: 'https://ashjha75.github.io/MyDocs/',
    base: '/MyDocs/',

    integrations: [starlight({
        logo: {
            src: '/public/favicon.svg', // Path to your logo in the public folder
            alt: 'MyDocs',
        },
        title: 'My Docs',
        plugins: [starlightThemeGalaxy()],
        customCss: ['./src/styles/mermaid.css', './src/styles/global.css'],
        social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Ashjha75' },
        { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/ashjha75/' },
        { icon: 'twitter', label: 'Twitter', href: 'https://x.com/ashish5jha' },
        { icon: 'external', label: 'Portfolio', href: 'https://ashish5jha.github.io/portfolio/' }],
        // plugins: [starlightThemeObsidian()],
        head: [
            {
                tag: 'script',
                attrs: { src: '/MyDocs/scripts/mermaid-init.js', defer: true },
            },
            {
                tag: 'script',
                attrs: { src: '/MyDocs/scripts/sidebar.js', defer: true }, // <-- your custom script
            },
            {
                tag: 'script',
                attrs: { src: '/MyDocs/scripts/zoom.js', defer: true }, // <-- your custom script
            },],
        sidebar: [
            {
                label: '🌱 Springboot',
                items: [
                    {
                        label: 'Base',
                        items: [
                            { label: 'Rest Basics', link: '/springboot/base/rest' },
                            { label: 'Attacks', link: '/springboot/base/common-attacks' },


                        ],
                    },
                    {
                        label: 'Core',
                        items: [
                            { label: 'Springboot starter', link: '/springboot/core/springboot-starter' },
                            { label: 'Springboot  MVC Request Flow', link: '/springboot/core/core2' },
                            { label: 'Springboot Internals', link: '/springboot/core/core3' },
                            { label: 'Springboot Validation & DTOs', link: '/springboot/core/core4' },
                            { label: 'Springboot Exception Handling', link: '/springboot/core/exception-handling' },
                            { label: 'Building REST Endpoints', link: '/springboot/core/rest-api' },
                            { label: 'Springboot AOP', link: '/springboot/core/aop' },
                            { label: 'Essentials Spring Boot Compendium', link: '/springboot/core/essentials' },

                        ],
                    },
                    {
                        label: 'MVC',
                        items: [
                            { label: 'Spring Mvc 1', link: '/springboot/mvc/mvc1' },
                            { label: 'Spring Mvc 2', link: '/springboot/mvc/mvc2' },
                        ],
                    },
                    {
                        label: 'Spring Data Jpa',
                        items: [
                            { label: 'Jpa Core', link: '/springboot/jpa/jpacore' },
                            { label: 'Jpa Caching', link: '/springboot/jpa/jpacaching' },
                            { label: 'Modeling & Repositories', link: '/springboot/jpa/models-repo' },
                            { label: 'Relational Mappings', link: '/springboot/jpa/relational-mappings' },
                            { label: 'Querying Techniques', link: '/springboot/jpa/query' },
                            { label: 'Transaction Management', link: '/springboot/jpa/transaction' },
                            { label: 'Auditing & Lifecycle Events', link: '/springboot/jpa/auditing' },
                            { label: 'Performance & Concurrency', link: '/springboot/jpa/advance' },
                        ],
                    },
                    {
                        label: 'Spring Security',
                        items: [
                            { label: 'Spring Security Basics', link: '/springboot/security/security-base' },
                            { label: 'Spring Security User Creations', link: '/springboot/security/users-creations' },
                            { label: 'Spring Security Web Securities', link: '/springboot/security/web-securities' },
                            { label: 'Spring Security JWT', link: '/springboot/security/jwt' },
                            {
                                label: 'JWT ', items: [
                                    { label: 'Security Config', link: '/springboot/security/jwt/security-config' },
                                    { label: 'Jwt utils', link: '/springboot/security/jwt/jwt-utils' },
                                    { label: 'Auth Token Filter', link: '/springboot/security/jwt/auth-token-filter' },
                                    { label: 'Custom User Details Service', link: '/springboot/security/jwt/custom-user-details-service' },
                                ]
                            },
                        ],
                    },

                    {
                        label: 'Spring Test',
                        items: [
                            { label: 'Spring Junit basics', link: '/springboot/testing/junitlec1' },
                            { label: 'Spring Junit Architecture', link: '/springboot/testing/junit-architecture' },
                            { label: 'Spring Junit Slicing', link: '/springboot/testing/slicing' },
                            { label: 'Spring Mockito basics', link: '/springboot/testing/mockito' },
                            { label: 'Spring Layered Testing', link: '/springboot/testing/layer-testing' },


                        ],
                    },
                    {
                        label: 'Spring Essentials',
                        items: [
                            { label: 'Spring Logging', link: '/springboot/essentials/log' },
                            { label: 'Spring Code Quality', link: '/springboot/essentials/code-quality' },

                        ],
                    },
                ],
            },

            {
                label: '⛈️ Mysql',
                items: [
                    { label: 'Basics', link: '/mysql/mysqlbasic' },
                    { label: 'DDL', link: '/mysql/mysqlddl' },

                    {
                        label: "Retrival",
                        items: [
                            { label: 'Comparision Operator', link: '/mysql/retrival/comparision-operator' },
                            { label: 'Logical Operator', link: '/mysql/retrival/logical-operator' },
                            { label: 'Range Set Operators', link: '/mysql/retrival/range-setoperators' },
                            { label: 'Patterns Matching', link: '/mysql/retrival/patterns-matching' },
                            { label: 'Distinct', link: '/mysql/retrival/distinct' },
                            { label: 'Aliases', link: '/mysql/retrival/aliases' },
                            { label: 'Order By', link: '/mysql/retrival/order-by' },
                            { label: 'Limits', link: '/mysql/retrival/limits' },
                            { label: 'Select', link: '/mysql/retrival/select' },
                        ]
                    },
                    { label: 'Functions', link: '/mysql/function' },
                    { label: 'Group By', link: '/mysql/groupby' },
                    { label: 'Keys', link: '/mysql/keys' },
                    { label: 'Normalization', link: '/mysql/normalization' },
                    {
                        label: "Joins",
                        items: [
                            { label: 'Join Basics', link: '/mysql/join/joinbasics' },
                            { label: 'Inner Join', link: '/mysql/join/inner-join' },
                            { label: 'Left-Right Join', link: '/mysql/join/left-right-join' },
                            { label: 'Union Join', link: '/mysql/join/union-union-all' },
                            { label: 'Full Join', link: '/mysql/join/full-join' },
                            { label: 'Cross Join', link: '/mysql/join/cross-join' },
                        ]
                    },
                    {
                        label: "Subqueries", link: '/mysql/subquery'
                    }
                    ,
                    {
                        label: "Update", link: '/mysql/update'
                    }
                    ,
                    {
                        label: "Delete", link: '/mysql/delete'
                    }
                    ,
                    {
                        label: "Replace", link: '/mysql/replace'
                    }

                ],
            },
            {
                label: '🤖 Context',
                autogenerate: { directory: 'context' },
            },
            {
                label: '🪸 Devops',
                items: [
                    { label: 'Basics', link: '/devops/docker/basics' }
                ]
            },
        ],
    })],
});