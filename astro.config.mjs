// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';
import starlightThemeObsidian from 'starlight-theme-obsidian'
// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins: [],
		rehypePlugins: [rehypeMermaid],
	},

	site: 'https://ashjha75.github.io/MyDocs/',
	base: '/MyDocs/',

	integrations: [
		starlight({
			logo: {
				src: '/public/favicon.svg', // Path to your logo in the public folder
				alt: 'MyDocs',
			},
			title: 'My Docs',
			customCss: ['./src/styles/mermaid.css'],
			// social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			// plugins: [starlightThemeObsidian()],
			sidebar: [
				{
					label: 'Springboot',
					items: [
						{
							label: 'ProjectDocs',
							items: [
								{ label: 'Springboot starter', link: '/springboot/Core/springboot-starter' },
								{ label: 'Springboot  MVC Request Flow', link: '/springboot/Core/core2' },
								{ label: 'Springboot Internals', link: '/springboot/Core/core3' },
								{ label: 'Springboot Validation & DTOs', link: '/springboot/Core/core4' },
								{ label: 'Springboot Exception Handling', link: '/springboot/Core/exception-handling' },
								{ label: 'Building REST Endpoints', link: '/springboot/Core/rest-api' },
								{ label: 'Springboot AOP', link: '/springboot/Core/aop' },
								{ label: 'Essentials Spring Boot Compendium', link: '/springboot/Core/essentials' },

							],
						},
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
