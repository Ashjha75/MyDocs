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
			customCss: ['./src/styles/mermaid.css','./src/styles/global.css'],
			// social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			// plugins: [starlightThemeObsidian()],
			sidebar: [
				{
					label: 'Springboot',
					items: [
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
