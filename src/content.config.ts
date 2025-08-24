import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import rehypeMermaid from 'rehype-mermaid';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	// blog: defineCollection({ schema: blogSchema }),
	
};
