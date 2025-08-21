// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';
import starlightThemeObsidian from 'starlight-theme-obsidian'
// https://astro.build/config
export default defineConfig({
	markdown: {
		rehypePlugins: [rehypeMermaid],
	},

	site: 'https://ashjha75.github.io/MyDocs/',
	base: '/MyDocs/',
	integrations: [
		starlight({
			title: 'My Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			// plugins: [starlightThemeObsidian()],
			sidebar: [
				{
					label: 'Springboot',
					items: [
						{
							label: 'ProjectDocs',
							items: [
								{ label: 'Springboot starter', link: '/springboot/projectdocs/springboot-starter'},
								// { label: 'Springboot starter Detail', link: '/springboot/projectdocs/springboot-starter-details'},
								{ label: 'Springboot  MVC Request Flow', link: '/springboot/projectdocs/core2' },
								{ label: 'Spring Boot Internals', link: '/springboot/projectdocs/core3' },
								{ label: 'Springboot Validation & DTOs', link: '/springboot/projectdocs/core4' },

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
