'use client'

// KnowledgeView — client wrapper that owns the active tab state. Server
// Component (the page) fetches configuratorOptionsQuery once and passes the
// 4 lists in. Each tab panel renders an isolated list/grid component.

import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/common/Tabs'
import {ContentIdeaCardGrid} from './ContentIdeaCardGrid'
import {BrandList} from './BrandList'
import {StyleList} from './StyleList'
import {PromptTemplateTable} from './PromptTemplateTable'
import type {ConfiguratorOptions} from '@/lib/groq/configurator'

interface Props {
  options: ConfiguratorOptions
}

export function KnowledgeView({options}: Props) {
  return (
    <Tabs defaultValue="idea" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="idea">アイデア ({options.contentIdeas.length})</TabsTrigger>
        <TabsTrigger value="brand">ブランド ({options.brandProfiles.length})</TabsTrigger>
        <TabsTrigger value="style">スタイル ({options.visualStyleProfiles.length})</TabsTrigger>
        <TabsTrigger value="prompt">プロンプト ({options.promptTemplates.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="idea">
        <ContentIdeaCardGrid ideas={options.contentIdeas} />
      </TabsContent>
      <TabsContent value="brand">
        <BrandList brands={options.brandProfiles} />
      </TabsContent>
      <TabsContent value="style">
        <StyleList styles={options.visualStyleProfiles} />
      </TabsContent>
      <TabsContent value="prompt">
        <PromptTemplateTable templates={options.promptTemplates} />
      </TabsContent>
    </Tabs>
  )
}
