import type {StructureBuilder, StructureResolver} from 'sanity/structure'

// Schemas that hold a direct `sourceContentIdea` reference and can be grouped
// under a Content Idea hub.
const directGroupedTypes: Array<{type: string; title: string}> = [
  {type: 'visualAssetPlan', title: 'Visual Asset Plans'},
  {type: 'diagramPlan', title: 'Diagram Plans'},
  {type: 'platformOutput', title: 'Platform Outputs'},
  {type: 'workflow', title: 'Workflows'},
  {type: 'substackPostPlan', title: 'Substack Post Plans'},
  {type: 'substackNotesPlan', title: 'Substack Notes Plans'},
  {type: 'substackGrowthAction', title: 'Substack Growth Actions'},
]

// All document types should still be reachable from a flat-by-type list for
// debugging / power use, in the same order they are registered in schemas/index.ts.
const allDocumentTypes: Array<{type: string; title: string}> = [
  {type: 'contentIdea', title: 'Content Ideas'},
  {type: 'prompt', title: 'Prompts'},
  {type: 'platformOutput', title: 'Platform Outputs'},
  {type: 'diagramPlan', title: 'Diagram Plans'},
  {type: 'visualAssetPlan', title: 'Visual Asset Plans'},
  {type: 'workflow', title: 'Workflows'},
  {type: 'publishedOutput', title: 'Published Outputs'},
  {type: 'tool', title: 'Tools'},
  {type: 'substackPublicationStrategy', title: 'Substack Publication Strategies'},
  {type: 'substackPostPlan', title: 'Substack Post Plans'},
  {type: 'substackNotesPlan', title: 'Substack Notes Plans'},
  {type: 'substackGrowthAction', title: 'Substack Growth Actions'},
  {type: 'brandProfile', title: 'Brand Profiles'},
  {type: 'visualStyleProfile', title: 'Visual Style Profiles'},
  {type: 'promptTemplate', title: 'Prompt Templates'},
  {type: 'campaignPlan', title: 'Campaign Plans'},
]

function buildContentIdeaChildList(S: StructureBuilder, contentIdeaId: string) {
  const items = [
    S.listItem()
      .id('content-idea-overview')
      .title('Overview')
      .child(S.document().documentId(contentIdeaId).schemaType('contentIdea')),
  ]

  for (const {type, title} of directGroupedTypes) {
    items.push(
      S.listItem()
        .id(`content-idea-${type}`)
        .title(title)
        .child(
          S.documentList()
            .id(`${type}-by-content-idea-${contentIdeaId}`)
            .title(title)
            .schemaType(type)
            .filter('_type == $type && sourceContentIdea._ref == $contentIdeaId')
            .params({type, contentIdeaId}),
        ),
    )
  }

  // substackPublicationStrategy uses both `sourceContentIdea` and an array
  // `relatedContentIdeas`. Match either via the GROQ `references()` helper so the
  // hub view also shows publications that only reference a Content Idea through
  // the related-list.
  items.push(
    S.listItem()
      .id('content-idea-substackPublicationStrategy')
      .title('Substack Publication Strategies')
      .child(
        S.documentList()
          .id(`substackPublicationStrategy-by-content-idea-${contentIdeaId}`)
          .title('Substack Publication Strategies')
          .schemaType('substackPublicationStrategy')
          .filter('_type == "substackPublicationStrategy" && references($contentIdeaId)')
          .params({contentIdeaId}),
      ),
  )

  return items
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .id('content-ideas-hub')
        .title('Content Ideas')
        .child(
          S.list()
            .id('content-ideas-hub-list')
            .title('Content Ideas')
            .items([
              S.listItem()
                .id('content-ideas-all')
                .title('All Content Ideas')
                .child(
                  S.documentTypeList('contentIdea')
                    .id('content-idea-all-list')
                    .title('All Content Ideas'),
                ),
              S.listItem()
                .id('content-ideas-by-idea')
                .title('By Content Idea')
                .child(
                  S.documentTypeList('contentIdea')
                    .id('content-idea-by-idea-list')
                    .title('Select a Content Idea')
                    .child((contentIdeaId) =>
                      S.list()
                        .id(`content-idea-detail-${contentIdeaId}`)
                        .title('Content Idea Detail')
                        .items(buildContentIdeaChildList(S, contentIdeaId)),
                    ),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .id('by-type')
        .title('By Type (flat)')
        .child(
          S.list()
            .id('by-type-list')
            .title('By Type')
            .items(
              allDocumentTypes.map(({type, title}) =>
                S.listItem()
                  .id(`by-type-${type}`)
                  .title(title)
                  .child(S.documentTypeList(type).id(`by-type-${type}-list`).title(title)),
              ),
            ),
        ),
    ])
