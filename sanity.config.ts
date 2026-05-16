import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Sanity AI Content OS',

  projectId,
  dataset,

  plugins: [structureTool({structure})],

  schema: {
    types: schemaTypes,
  },
})
